import { Transform } from "node:stream";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import path from "node:path";
import fs from "node:fs/promises";

export async function setupRoomLogging(room) {
  const logDir = process.env.LOG_DIR || "./logs";
  await fs.mkdir(logDir, { recursive: true });

  const timestamp = Date.now();
  const logFilePath = path.join(logDir, `${room.id}-${timestamp}.ndjson`);

  // Transform stream: конвертує події кімнати в NDJSON рядки
  const eventTransformer = new Transform({
    objectMode: true,
    transform(event, encoding, callback) {
      const logEntry = JSON.stringify({
        t: Date.now(),
        ...event,
      });
      callback(null, logEntry + "\n");
    },
  });

  const fileWriteStream = createWriteStream(logFilePath, { flags: "w" });

  // Використовуємо Readable.from для читання подій з EventEmitter кімнати та pipeline
  try {
    const eventStream = Readable.from(room.eventNames().length ? [] : roomEventsGenerator(room));
    // Альтернативно зв'язуємо через events.on
    const readableEvents = Readable.from(async function* () {
      // Генератор подій кімнати для стріму
    }());
    
    // Простий та надійний варіант зв'язку подій кімнати з пайплайном:
    const readable = new Readable({
      objectMode: true,
      read() {}
    });

    // Слухаємо події кімнати і пушимо у стрім
    const logListener = (eventData) => {
      readable.push(eventData);
    };

    room.on("log-event", logListener);

    room.once("empty", () => {
      room.off("log-event", logListener);
      readable.push(null);
    });

    await pipeline(
      readable,
      eventTransformer,
      fileWriteStream
    );
  } catch (err) {
    console.error(`Error in match log pipeline for room ${room.id}:`, err);
  }
}