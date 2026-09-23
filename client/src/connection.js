const DEFAULT_RECONNECT_DELAYS = [500, 1000, 2000, 4000, 8000, 15000];

export class Connection {
  constructor({
    url = "/ws",
    reconnectDelays = DEFAULT_RECONNECT_DELAYS,
    onmessage = null,
    onopen = null,
    onclose = null,
    onerror = null,
  } = {}) {
    this.url = url;
    this.reconnectDelays = reconnectDelays;

    this.onmessage = onmessage;
    this.onopen = onopen;
    this.onclose = onclose;
    this.onerror = onerror;

    this.socket = null;
    this.queue = [];
    this.reconnectAttempt = 0;
    this.reconnectTimer = null;
    this.closedManually = false;
  }

  connect() {
    this.closedManually = false;

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.clearReconnectTimer();

    const socket = new WebSocket(this.url);
    this.socket = socket;

    socket.addEventListener("open", () => {
      if (socket !== this.socket) {
        return;
      }

      this.reconnectAttempt = 0;
      this.flushQueue();

      this.onopen?.();
    });

    socket.addEventListener("message", (event) => {
      if (socket !== this.socket) {
        return;
      }

      let message;

      try {
        message = JSON.parse(event.data);
      } catch {
        this.onerror?.(new Error("Received invalid JSON"));
        return;
      }

      this.onmessage?.(message);
    });

    socket.addEventListener("error", (event) => {
      if (socket !== this.socket) {
        return;
      }

      this.onerror?.(event);
    });

    socket.addEventListener("close", (event) => {
      if (socket !== this.socket) {
        return;
      }

      this.socket = null;
      this.onclose?.(event);

      if (!this.closedManually) {
        this.scheduleReconnect();
      }
    });
  }

  send(message) {
    const encoded = JSON.stringify(message);

    if (
      this.socket &&
      this.socket.readyState === WebSocket.OPEN
    ) {
      this.socket.send(encoded);
      return true;
    }

    this.queue.push(encoded);

    this.connect();

    return false;
  }

  close() {
    this.closedManually = true;
    this.clearReconnectTimer();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  scheduleReconnect() {
    if (this.closedManually || this.reconnectTimer) {
      return;
    }

    const index = Math.min(
      this.reconnectAttempt,
      this.reconnectDelays.length - 1
    );

    const delay = this.reconnectDelays[index];

    this.reconnectAttempt += 1;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  flushQueue() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    while (this.queue.length > 0) {
      this.socket.send(this.queue.shift());
    }
  }

  clearReconnectTimer() {
    if (!this.reconnectTimer) {
      return;
    }

    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }
}
