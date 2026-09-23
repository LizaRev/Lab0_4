// server/src/replay.js
import fs from "node:fs";
import readline from "node:readline";

export async function* replayLog(filePath) {
  const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.trim()) {
      try {
        yield JSON.parse(line);
      } catch {
        // Пропускаем битые строки
      }
    }
  }
}