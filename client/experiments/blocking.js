export function createBlockingExperiment() {
  let renderFrames = 0;

  return function blockEvery60Frames() {
    renderFrames++;

    if (renderFrames % 60 === 0) {
      const t = performance.now();

      while (performance.now() < t + 100) {
        // Навмисно порожній цикл для блокування головного потоку.
      }

      console.log('Blocking: 100 ms');
    }
  };
}