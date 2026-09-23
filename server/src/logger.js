// server/src/logger.js
import fs from "node:fs";
import path from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { LOG_DIR } from "./config.js";

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export function setupRoomLogging(room) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const logPath = path.join(LOG_DIR, `${room.id}-${timestamp}.ndjson`);
  
  const writeStream = fs.createWriteStream(logPath, { flags: "a" });

  // Transform stream: превращает объект события в строку NDJSON
  const serializer = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      const eventWithTime = {
        t: Date.now(),
        ...chunk,
      };
      callback(null, JSON.stringify(eventWithTime) + "\n");
    },
  });

  // Берем события из EventEmitter комнаты и пускаем через pipeline
  // (Здесь можно использовать Readable.from или просто слушать эмиттер)
  const eventsStream = new Transform({
    objectMode: true,
    transform(event, encoding, callback) {
      callback(null, event);
    }
  });

  // Подписываемся на события комнаты и отправляем в поток
  const onEvent = (eventData) => {
    eventsStream.write(eventData);
  };

  room.on("log-event", onEvent);

  // Когда комната удаляется, закрываем стримы
  room.once("empty", () => {
    room.off("log-event", onEvent);
    eventsStream.end();
  });

  pipeline(eventsStream, serializer, writeStream).catch((err) => {
    console.error(`Logging pipeline error for room ${room.id}:`, err);
  });
}