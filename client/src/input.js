export function createInput(target) {
  const keys = new Set();
  const justPressedKeys = new Set();

  function onKeyDown(event) {
    if (!keys.has(event.code)) {
      justPressedKeys.add(event.code);
    }

    keys.add(event.code);

    if (event.code === 'Space') {
      event.preventDefault();
    }
  }

  function onKeyUp(event) {
    keys.delete(event.code);
  }

  target.addEventListener('keydown', onKeyDown);
  target.addEventListener('keyup', onKeyUp);

  return {
    isDown(code) {
      return keys.has(code);
    },

    justPressed(code) {
      return justPressedKeys.has(code);
    },

    endFrame() {
      justPressedKeys.clear();
    }
  };
}