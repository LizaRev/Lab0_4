
export function createLoop({
  step = 1 / 60,
  simulate,
  render
}) {

  let running = false;
  let lastTime = null;
  let accumulator = 0;
  let animationId = null;

  let stepsCount = 0;
  let framesCount = 0;

  let lastFrameDuration = 0;
  let statsTimer = 0;

  let stepsPerSecond = 0;
  let framesPerSecond = 0;


  function frame(time) {

    if (!running) {
      return;
    }


    const frameStart =
      performance.now();


    if (lastTime === null) {

      lastTime = time;
      statsTimer = time;

    }


    const delta =
      Math.min(
        (time - lastTime) / 1000,
        0.25
      );


    lastTime = time;


    accumulator += delta;


    while (accumulator >= step) {

      simulate(step);

      stepsCount++;

      accumulator -= step;

    }


    const alpha =
      accumulator / step;


    render(alpha);


    framesCount++;


    lastFrameDuration =
      performance.now() -
      frameStart;


    if (
      time - statsTimer >= 1000
    ) {

      const elapsed =
        (time - statsTimer) / 1000;


      stepsPerSecond =
        Math.round(
          stepsCount / elapsed
        );


      framesPerSecond =
        Math.round(
          framesCount / elapsed
        );


      stepsCount = 0;
      framesCount = 0;

      statsTimer = time;

    }


    animationId =
      requestAnimationFrame(frame);

  }


  return {

    start() {

      if (running) {
        return;
      }


      running = true;

      lastTime = null;

      accumulator = 0;


      animationId =
        requestAnimationFrame(frame);

    },


    stop() {

      if (!running) {
        return;
      }


      running = false;


      cancelAnimationFrame(
        animationId
      );

    },


    getStats() {

      return {

        stepsPerSecond,

        framesPerSecond,

        lastFrameDuration

      };

    }

  };

}

