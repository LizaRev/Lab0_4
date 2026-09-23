import fs from "node:fs";
import path from "node:path";

const OUTPUT_DIR = path.resolve("server/logs");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "synthetic-200mb.ndjson");

const TARGET_SIZE = 200 * 1024 * 1024;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const stream = fs.createWriteStream(OUTPUT_FILE);

let written = 0;
let eventId = 0;

function createEvent() {
  eventId++;

  return JSON.stringify({
    t: Date.now(),
    type: "synthetic",
    eventId,
    playerId: "test-player",
    data: "x".repeat(900),
  }) + "\n";
}

function writeMore() {
  while (written < TARGET_SIZE) {
    const line = createEvent();
    const buffer = Buffer.from(line);

    written += buffer.length;

    const canContinue = stream.write(buffer);

    if (!canContinue) {
      stream.once("drain", writeMore);
      return;
    }
  }

  stream.end();
}

stream.on("finish", () => {
  const sizeMB = written / 1024 / 1024;

  console.log(`Synthetic log created: ${OUTPUT_FILE}`);
  console.log(`Size: ${sizeMB.toFixed(2)} MB`);
  console.log(`Events: ${eventId}`);
});

stream.on("error", (error) => {
  console.error("Failed to create synthetic log:", error);
  process.exitCode = 1;
});

writeMore();

