console.log('Variable timestep experiment started');

const duration = 5000;
const thrustPower = 200;

let x = 0;
let y = 0;

let vx = 0;
let vy = 0;

let angle = 0;

let previousTime = performance.now();
const startTime = previousTime;

let frames = 0;

function frame(time) {
  const dt = (time - previousTime) / 1000;
  previousTime = time;

  vx += Math.cos(angle) * thrustPower * dt;
  vy += Math.sin(angle) * thrustPower * dt;

  x += vx * dt;
  y += vy * dt;

  frames++;

  const elapsed = time - startTime;

  if (elapsed >= duration) {
    console.log('--- Variable timestep results ---');
    console.log(`Duration: ${(elapsed / 1000).toFixed(2)} s`);
    console.log(`Frames: ${frames}`);
    console.log(`Final X: ${x.toFixed(2)}`);
    console.log(`Final Y: ${y.toFixed(2)}`);
    console.log(`Final position: (${x.toFixed(2)}, ${y.toFixed(2)})`);
    return;
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);