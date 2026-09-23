console.log('setInterval experiment started');

const frameTimes = [];

let frames = 0;
let foregroundFrames = 0;
let backgroundFrames = 0;

const startTime = performance.now();
let previousTime = startTime;

let phase = 'foreground';

const intervalId = setInterval(() => {
  const currentTime = performance.now();

  const frameTime = currentTime - previousTime;
  previousTime = currentTime;

  frameTimes.push(frameTime);
  frames++;

  const elapsed = currentTime - startTime;

  if (phase === 'foreground') {
    foregroundFrames++;
  } else {
    backgroundFrames++;
  }

  
  if (phase === 'foreground' && elapsed >= 10000) {
    phase = 'background';

    console.log('--- Foreground results ---');
    console.log(`Duration: ${(elapsed / 1000).toFixed(2)} s`);
    console.log(`Frames: ${foregroundFrames}`);
    console.log(
      `FPS: ${(foregroundFrames / (elapsed / 1000)).toFixed(2)}`
    );

    console.log('Switch to another browser tab NOW.');
    console.log('Stay there for 5 seconds, then return.');
  }

  
  if (elapsed >= 15000) {
    clearInterval(intervalId);

    const backgroundDuration = elapsed - 10000;
    const backgroundFps =
      backgroundFrames / (backgroundDuration / 1000);

    console.log('--- Background results ---');
    console.log(
      `Background duration: ${(backgroundDuration / 1000).toFixed(2)} s`
    );
    console.log(`Background frames: ${backgroundFrames}`);
    console.log(`Background FPS: ${backgroundFps.toFixed(2)}`);

    const averageFrameTime =
      frameTimes.reduce((sum, value) => sum + value, 0) /
      frameTimes.length;

    const variance =
      frameTimes.reduce(
        (sum, value) =>
          sum + Math.pow(value - averageFrameTime, 2),
        0
      ) / frameTimes.length;

    const jitter = Math.sqrt(variance);

    console.log('--- Overall setInterval results ---');
    console.log(`Total frames: ${frames}`);
    console.log(
      `Average frame time: ${averageFrameTime.toFixed(2)} ms`
    );
    console.log(`Frame-time jitter: ${jitter.toFixed(2)} ms`);
    console.log('Experiment finished.');
  }
}, 16);