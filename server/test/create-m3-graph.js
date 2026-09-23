import fs from "node:fs";
import path from "node:path";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

const width = 1000;
const height = 600;

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour: "white",
});

const configuration = {
  type: "line",

  data: {
    labels: [
      "0 MB",
      "34.2 MB",
      "39.2 MB",
      "59.2 MB",
    ],

    datasets: [
      {
        label: "Server RSS (MB)",

        data: [
          85.45,
          100.16,
          100.59,
          100.91,
        ],

        fill: false,
        tension: 0.2,
      },
    ],
  },

  options: {
    responsive: false,

    plugins: {
      title: {
        display: true,
        text: "M3 Backpressure Test: Server RSS",
        font: {
          size: 20,
        },
      },
    },

    scales: {
      x: {
        title: {
          display: true,
          text: "Downloaded data",
        },
      },

      y: {
        title: {
          display: true,
          text: "Server RSS (MB)",
        },

        beginAtZero: false,
      },
    },
  },
};

const imageBuffer =
  await chartJSNodeCanvas.renderToBuffer(configuration);

const outputPath = path.resolve(
  "server/test/m3-rss-streaming.png"
);

fs.writeFileSync(outputPath, imageBuffer);

console.log(`Graph created: ${outputPath}`);

