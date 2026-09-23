let audioContext = null;

let buffers = {};

export function createAudio() {
  audioContext = new AudioContext();

  function setBuffers(assets) {
    buffers = {
      shoot: assets.shoot,
      hit: assets.hit,
      explosion: assets.explosion
    };
  }

  function play(name) {
    const buffer = buffers[name];

    if (!buffer) {
      return;
    }

    if (audioContext.state === 'suspended') {
      return;
    }

    const source = audioContext.createBufferSource();

    source.buffer = buffer;

    source.connect(
      audioContext.destination
    );

    source.start();
  }

  function unlock() {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  function attach(world) {

    world.addEventListener(
      'fired',
      () => {
        play('shoot');
      }
    );

    world.addEventListener(
      'hit',
      () => {
        play('hit');
      }
    );

    world.addEventListener(
      'exploded',
      () => {
        play('explosion');
      }
    );
  }

  return {
    ctx: audioContext,
    setBuffers,
    play,
    unlock,
    attach
  };
}