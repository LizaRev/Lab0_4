import { createLoop } from './loop.js';
import { createInput } from './input.js';

import { Ship } from './sim/ship.js';
import { Asteroid } from './sim/asteroid.js';
import { Pickup } from './sim/pickup.js';
import { World } from './sim/world.js';

import { attachHoming } from './sim/homing.js';
import { wrapShip } from './sim/arena.js';

import { createCanvas } from './render/canvas.js';
import { drawScene } from './render/draw.js';
import { drawLoadingScreen } from './render/loading.js';

import { loadJson, loadAll } from './assets/loader.js';

import { createAudio } from './audio.js';
import { initHud } from './hud.js';

import { Lobby } from './lobby.js';
import { createLobbyUI } from './lobby-ui.js';


async function startGame() {

  const lobby =
    new Lobby();


  // Спочатку ставимо слухач joined.
  // Це важливо, бо UI може викликати join одразу.

  const joined =
    new Promise((resolve) => {

      lobby.addEventListener(
        "joined",
        (event) => {

          resolve(
            event.detail
          );

        },
        { once: true }
      );

    });


  // Тепер створюємо lobby UI.

  createLobbyUI(
    lobby
  );


  // Чекаємо реального joined від сервера.

  const joinedData =
    await joined;


  const playerName =
    joinedData.playerName || "";


  const room =
    joinedData.room || null;


  const initialPlayers =
    joinedData.players || [];


  console.log(
    "Player:",
    playerName
  );


  console.log(
    "Joined room:",
    room?.id
  );


  console.log(
    "Arena:",
    room?.arena
  );


  console.log(
    "Players:",
    initialPlayers
  );


  // =========================
  // CANVAS
  // =========================

  const canvas =
    createCanvas();


  drawLoadingScreen(
    canvas.ctx,
    canvas.width,
    canvas.height,
    0
  );


  // =========================
  // AUDIO
  // =========================

  const audio =
    createAudio();


  window.addEventListener(
    "click",
    () => {

      audio.unlock();

    },
    { once: true }
  );


  // =========================
  // ASSETS
  // =========================

  const manifestUrl =
    new URL(
      "./assets/manifest.json",
      import.meta.url
    ).href;


  const manifest =
    await loadJson(
      manifestUrl
    );


  const assets =
    await loadAll(
      manifest,
      {
        audioContext:
          audio.ctx,

        baseUrl:
          manifestUrl,

        onProgress(progress) {

          drawLoadingScreen(
            canvas.ctx,
            canvas.width,
            canvas.height,
            progress
          );

        }

      }
    );


  console.log(
    "Assets loaded:",
    assets
  );


  audio.setBuffers(
    assets
  );


  // =========================
  // INPUT
  // =========================

  const input =
    createInput(
      window
    );


  // =========================
  // WORLD
  // =========================

  const world =
    new World();


  audio.attach(
    world
  );


  // =========================
  // HUD
  // =========================

  const hud =
    initHud(
      world,
      lobby,
      initialPlayers
    );


  // =========================
  // PLAYER SHIP
  // =========================

  const firstShip =
    new Ship(
      canvas.width / 2,
      canvas.height / 2
    );


  world.spawn(
    firstShip
  );


  // =========================
  // ASTEROID 1
  // =========================

  const asteroid =
    new Asteroid(
      200,
      200,
      100,
      80,
      30
    );


  world.spawn(
    asteroid
  );


  attachHoming(
    asteroid,
    firstShip
  );


  // =========================
  // ASTEROID 2
  // =========================

  const secondAsteroid =
    new Asteroid(
      600,
      350,
      -80,
      -60,
      30
    );


  world.spawn(
    secondAsteroid
  );


  // =========================
  // PICKUP
  // =========================

  const pickup =
    new Pickup(
      600,
      300,
      "shield"
    );


  world.spawn(
    pickup
  );


  // =========================
  // GET SHIP
  // =========================

  function getShip() {

    for (
      const ship of
      world.ofKind("ship")
    ) {

      return ship;

    }


    return null;
  }


  // =========================
  // PREVIOUS STATE
  // =========================

  let previous = {

    x:
      firstShip.pos.x,

    y:
      firstShip.pos.y,

    angle:
      firstShip.angle,

    thrust:
      firstShip.thrust

  };


  // =========================
  // LOOP STATS
  // =========================

  let loopStats = {

    stepsPerSecond: 0,

    framesPerSecond: 0,

    lastFrameDuration: 0

  };


  // =========================
  // LERP
  // =========================

  function lerp(
    a,
    b,
    alpha
  ) {

    return (
      a +
      (b - a) * alpha
    );

  }


  // =========================
  // LERP ANGLE
  // =========================

  function lerpAngle(
    a,
    b,
    alpha
  ) {

    const twoPi =
      Math.PI * 2;


    let difference =
      (b - a) % twoPi;


    if (
      difference > Math.PI
    ) {

      difference -=
        twoPi;

    }


    if (
      difference < -Math.PI
    ) {

      difference +=
        twoPi;

    }


    return (
      a +
      difference * alpha
    );

  }


  // =========================
  // RENDER
  // =========================

  function render(alpha) {

    const ship =
      getShip();


    hud.update(
      ship,
      loopStats
    );


    if (ship) {

      const renderedShip = {

        x:
          lerp(
            previous.x,
            ship.pos.x,
            alpha
          ),

        y:
          lerp(
            previous.y,
            ship.pos.y,
            alpha
          ),

        angle:
          lerpAngle(
            previous.angle,
            ship.angle,
            alpha
          ),

        thrust:
          ship.thrust

      };


      drawScene(
        canvas.ctx,
        canvas.width,
        canvas.height,
        renderedShip,
        world,
        assets
      );

    } else {

      drawScene(
        canvas.ctx,
        canvas.width,
        canvas.height,
        null,
        world,
        assets
      );

    }

  }


  // =========================
  // GAME LOOP
  // =========================

  const loop =
    createLoop({

      step:
        1 / 60,


      simulate(dt) {

        const ship =
          getShip();


        if (ship) {

          previous = {

            x:
              ship.pos.x,

            y:
              ship.pos.y,

            angle:
              ship.angle,

            thrust:
              ship.thrust

          };


          if (
            input.justPressed(
              "Space"
            )
          ) {

            ship.fire();


            world.dispatchEvent(
              new CustomEvent(
                "fired"
              )
            );

          }


          wrapShip(
            ship,
            canvas.width,
            canvas.height
          );

        }


        const inputs = {

          input,

          width:
            canvas.width,

          height:
            canvas.height

        };


        world.step(
          dt,
          inputs
        );


        input.endFrame();

      },


      render

    });


  // =========================
  // STATS UPDATE
  // =========================

  setInterval(
    () => {

      loopStats =
        loop.getStats();

    },
    100
  );


  // =========================
  // START
  // =========================

  loop.start();

}


startGame().catch(
  (error) => {

    console.error(
      "Помилка запуску гри:",
      error
    );

  }
);

