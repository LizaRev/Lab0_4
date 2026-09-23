export class GameConnection {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.sendQueue = [];
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 10000;
    this.connect();
  }

  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
      // Відправляємо все, що накопичилося в черзі під час підключення
      while (this.sendQueue.length > 0 && this.socket.readyState === WebSocket.OPEN) {
        const msg = this.sendQueue.shift();
        this.socket.send(JSON.stringify(msg));
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, ...payload } = data;
        
        // Викликаємо слухачів, зареєстрованих для цього типу повідомлення
        if (this.listeners.has(type)) {
          for (const callback of this.listeners.get(type)) {
            callback(payload);
          }
        }
      } catch (err) {
        console.error("Failed to parse incoming WebSocket message:", err);
      }
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected. Reconnecting...");
      this.scheduleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.socket.close();
    };
  }

  scheduleReconnect() {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  send(type, payload = {}) {
    const message = { type, ...payload };
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      // Ставимо в чергу, якщо з'єднання ще встановлюється
      this.sendQueue.push(message);
    }
  }

  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  off(type, callback) {
    if (!this.listeners.has(type)) return;
    const filtered = this.listeners.get(type.toLowerCase()).filter(cb => cb !== callback);
    this.listeners.set(type, filtered);
  }
}