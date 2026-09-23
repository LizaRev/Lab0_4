import { randomUUID } from "node:crypto";
import { WebSocketServer, WebSocket } from "ws";

import {
  MESSAGE_TYPES,
  PROTOCOL_VERSION,
  validateMessage,
} from "./protocol.js";

const JOIN_TIMEOUT_MS = 5_000;
const HEARTBEAT_MS = 15_000;
const MAX_MISSED_PONGS = 2;

// Налаштування захисту (M4)
const MAX_BUFFERED_AMOUNT = 64 * 1024; // 64 КБ поріг для повільного клієнта
const TOKEN_BUCKET_CAPACITY = 15;     // Максимум токенів
const TOKEN_REFILL_RATE = 10;         // Токенів додається за секунду

export function attachWebSocketServer(server, roomManager) {
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: 64 * 1024,
  });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(
      request.url || "/",
      `http://${request.headers.host || "localhost"}`
    );

    if (url.pathname !== "/ws") {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (socket) => {
    const player = {
      id: randomUUID(),
      name: "Guest",
      room: null,
    };

    socket.player = player;
    socket.room = null;

    let joined = false;
    let missedPongs = 0;

    // Token Bucket стан
    let tokens = TOKEN_BUCKET_CAPACITY;
    let lastRefill = Date.now();

    function checkRateLimit() {
      const now = Date.now();
      const elapsed = (now - lastRefill) / 1000;
      lastRefill = now;

      tokens = Math.min(
        TOKEN_BUCKET_CAPACITY,
        tokens + elapsed * TOKEN_REFILL_RATE
      );

      if (tokens < 1) {
        return false;
      }

      tokens -= 1;
      return true;
    }

    const send = (message, isCritical = true) => {
      if (socket.readyState !== WebSocket.OPEN) {
        return false;
      }

      // Slow client policy
      if (socket.bufferedAmount > MAX_BUFFERED_AMOUNT) {
        if (!isCritical) {
          // Пропускаємо некритичні повідомлення, щоб не забивати пам'ять
          return false;
        } else {
          console.warn(
            `Terminating slow client ${player.id}: buffer overflow (${socket.bufferedAmount} bytes)`
          );
          socket.close(1008, "Slow client: buffer overflow");
          return false;
        }
      }

      socket.send(JSON.stringify(message));
      return true;
    };

    player.send = send;

    const sendError = (error) => {
      send({
        version: PROTOCOL_VERSION,
        type: MESSAGE_TYPES.ERROR,
        error,
      }, true);
    };

    const joinTimeout = setTimeout(() => {
      if (!joined) {
        sendError("Join required within 5 seconds");
        socket.close(1008, "Join timeout");
      }
    }, JOIN_TIMEOUT_MS);

    const heartbeat = setInterval(() => {
      if (socket.readyState !== WebSocket.OPEN) {
        return;
      }

      if (missedPongs >= MAX_MISSED_PONGS) {
        console.log(`Terminating inactive socket ${player.id}`);
        socket.terminate();
        return;
      }

      missedPongs += 1;
      socket.ping();
    }, HEARTBEAT_MS);

    socket.on("pong", () => {
      missedPongs = 0;
    });

    socket.on("message", (raw) => {
      if (!checkRateLimit()) {
        console.warn(`Rate limit exceeded for player ${player.id}`);
        sendError("Rate limit exceeded");
        socket.close(1008, "Rate limit exceeded");
        return;
      }

      let message;

      try {
        message = JSON.parse(raw.toString());
      } catch {
        sendError("Invalid JSON");
        socket.close(1007, "Invalid JSON");
        return;
      }

      const result = validateMessage(message);

      if (!result.ok) {
        console.warn(
          `Invalid WebSocket message from ${player.id}: ${result.error}`
        );
        sendError(result.error);
        socket.close(1008, "Invalid message");
        return;
      }

      handleMessage(result.message);
    });

    socket.on("close", () => {
      clearTimeout(joinTimeout);
      clearInterval(heartbeat);

      if (socket.room) {
        const room = socket.room;
        room.removePlayer(player.id);

        room.broadcast({
          version: PROTOCOL_VERSION,
          type: MESSAGE_TYPES.ROSTER,
          roomId: room.id,
          players: room.roster(),
        }, null, true);

        socket.room = null;
        player.room = null;
      }
    });

    socket.on("error", (error) => {
      console.error(
        `WebSocket error for ${player.id}:`,
        error.message
      );
    });

    function handleMessage(message) {
      switch (message.type) {
        case MESSAGE_TYPES.PING:
          send({
            version: PROTOCOL_VERSION,
            type: MESSAGE_TYPES.PONG,
          }, true);
          break;

        case MESSAGE_TYPES.JOIN:
          joinRoom(message);
          break;

        case MESSAGE_TYPES.LEAVE:
          leaveRoom();
          break;

        case MESSAGE_TYPES.CHAT:
          chat(message);
          break;

        default:
          sendError("Unsupported message type");
      }
    }

    function joinRoom(message) {
      const roomId =
        typeof message.roomId === "string"
          ? message.roomId.trim()
          : "";

      const name =
        typeof message.name === "string" &&
        message.name.trim()
          ? message.name.trim().slice(0, 24)
          : "Guest";

      if (!roomId) {
        sendError("roomId is required");
        return;
      }

      const room = roomManager.get(roomId);

      if (!room) {
        sendError("Room not found");
        return;
      }

      if (socket.room) {
        leaveRoom();
      }

      player.name = name;
      player.room = room;
      socket.room = room;
      joined = true;
      clearTimeout(joinTimeout);

      try {
        room.addPlayer(player);
      } catch (err) {
        sendError(err.message);
        socket.close(1008, err.message);
        return;
      }

      room.emit("chat", {
        roomId: room.id,
        player,
        text: `${player.name} joined the room`,
      });

      broadcastRoster(room);
    }

    function leaveRoom() {
      const room = socket.room;

      if (!room) {
        return;
      }

      room.removePlayer(player.id);
      socket.room = null;
      player.room = null;

      broadcastRoster(room);
    }

    function chat(message) {
      const room = socket.room;

      if (!room) {
        sendError("Join a room first");
        return;
      }

      const text =
        typeof message.text === "string"
          ? message.text.trim().slice(0, 500)
          : "";

      if (!text) {
        sendError("Chat text is required");
        return;
      }

      room.emit("log-event", {
        type: "chat",
        playerId: player.id,
        name: player.name,
        text,
      });

      room.emit("chat", {
        roomId: room.id,
        player,
        text,
      });

      // Чат — не критичне повідомлення, може бути скинуте для повільного клієнта
      room.broadcast({
        version: PROTOCOL_VERSION,
        type: MESSAGE_TYPES.CHAT,
        roomId: room.id,
        playerId: player.id,
        name: player.name,
        text,
      }, null, false);
    }

    function broadcastRoster(room) {
      room.broadcast({
        version: PROTOCOL_VERSION,
        type: MESSAGE_TYPES.ROSTER,
        roomId: room.id,
        players: room.roster(),
      }, null, true);
    }
  });

  return wss;
}