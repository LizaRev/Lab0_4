import { loadJson, loadAll } from '../src/assets/loader.js';

const manifestUrl = new URL(
  '../src/assets/manifest.json',
  import.meta.url
);

async function loadSequential(manifest) {
  const items = [
    ...(manifest.sprites || []),
    ...(manifest.sounds || []),
    ...(manifest.data || [])
  ];

  const start = performance.now();

  let completed = 0;

  for (const item of items) {
    console.log(
      `Loading ${completed + 1}/${items.length}: ${item.name}`
    );

    await loadOne(item, manifestUrl);

    completed++;

    console.log(
      `Progress: ${Math.round(
        (completed / items.length) * 100
      )}%`
    );
  }

  const time = performance.now() - start;

  console.log(
    `Sequential loading time: ${time.toFixed(2)} ms`
  );

  return time;
}


async function loadOne(item, baseUrl) {
  const url = new URL(
    item.url,
    baseUrl
  ).href;

  if (item.type === 'image') {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = resolve;

      image.onerror = () => {
        reject(
          new Error(
            `Failed to load image: ${url}`
          )
        );
      };

      image.src = url;
    });
  }

  if (item.type === 'json') {
    return await loadJson(url);
  }

  if (item.type === 'audio') {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    return await response.arrayBuffer();
  }

  throw new Error(
    `Unknown resource type: ${item.type}`
  );
}


async function run() {
  console.log(
    '=== Sequential loading experiment ==='
  );

  const manifest =
    await loadJson(manifestUrl);

  await loadSequential(manifest);
}

run().catch((error) => {
  console.error(
    'Sequential loading failed:',
    error
  );
});