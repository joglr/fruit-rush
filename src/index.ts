// import State from './modules/State'
// import Gamepad from './modules/Gamepad'
// const state = State()

import init, {
  KeyboardInput,
  InputDevice,
  GamepadInput,
} from "./modules/InputDevice.js";
import { Player } from "./modules/Player.js";
import { Positionable } from "./modules/Positionable.js";
import { Updateable } from "./modules/Updateable.js";
import { randBetween, Vector2 } from "./modules/util.js";
import { Tree } from "./modules/Tree.js";
import { Water } from "./modules/Equipables/WaterGun.js";
import { Eucalyptus } from "./modules/Eucalyptus.js";
import { POSITIONABLE_SIZE } from "./modules/settings.js";
import { Fire } from "./modules/Equipables/NotAFlameThrower.js";

document.documentElement.style.setProperty('--positionableSize', `${POSITIONABLE_SIZE}px`)

const mapConfig = {
  areaSize: 16,
  modelSize: 16,
  imageSize: 12,
};

const gameContainer = document.querySelector("#game");
const infoContainer = document.querySelector("#info");
let lastAnimationFrameID: number;
// let inputDevice: InputDevice

// @ts-ignore
window.addEventListener("gamepadconnected", (e: GamepadEvent) => {
  const inputDevice = new GamepadInput(e.gamepad.index);
  createPlayer(inputDevice);
});

let keyboardPlayerActive: boolean = false;
window.addEventListener("keydown", () => {
  if (!keyboardPlayerActive) {
    const inputDevice = new KeyboardInput(
      ["d"],
      ["a"],
      ["s"],
      ["w"],
      ["arrowright"],
      ["arrowleft"],
      ["arrowdown"],
      ["arrowup"],
      ["v"],
      ["c"]
    );
    createPlayer(inputDevice);
  }
  keyboardPlayerActive = true;
});

// @ts-ignore
window.addEventListener("gamepaddisconnected", (e: GamepadEvent) => {
  // TODO: Test this with non-steam controller
  for (const p of players) {
    const gp = p.getInputDevice() as GamepadInput;
    if (gp.getGamepadIndex() === e.gamepad.index) {
      p.getDOMElement().remove();
      players.delete(p);
    }
  }
});

window.addEventListener("click", (e) => {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const fire = new Fire([e.pageX - W / 2, e.pageY - H / 2]);
  gameContainer?.appendChild(fire.getDOMElement());
  positionables.add(fire);
});

const pausedText = " (Paused)";

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    cancelAnimationFrame(lastAnimationFrameID);
    document.title += pausedText;
  } else {
    requestAnimationFrame(gameLoop);
    document.title = document.title.replace(pausedText, "");
  }
});

let lastFrameTime: number;

function gameLoop(timeStamp: number) {
  // @ts-ignore
  infoContainer.textContent = `fps ${calcFPS(
    lastFrameTime,
    timeStamp
  ).toFixed()} (${Math.round(timeStamp)})`;

  const flooredTimeStamp = Math.round(timeStamp);

  // Interval events
  if (flooredTimeStamp % 100 === 0 && positionables.size < 400) {
    const [W, H] = getWH();

    let [x, y] = generateRandomPos(W, H).getComponents();
    const fire = new Fire([x, y]);
    positionables.add(fire);
    gameContainer?.appendChild(fire.getDOMElement());

    [x, y] = generateRandomPos(W, H).getComponents();
    const water = new Water([x, y], [0,0]);
    positionables.add(water);
    gameContainer?.appendChild(water.getDOMElement());

    [x, y] = generateRandomPos(W, H).getComponents();
    const eucalyptus = new Eucalyptus([x, y]);
    positionables.add(eucalyptus);
    gameContainer?.appendChild(eucalyptus.getDOMElement());


  }

  for (const p of players) {
    const mv = p
      .getInputDevice()
      .getMovementVector()
      .getComponents()
      .toString();
    const av = p.getInputDevice().getAimVector().getComponents().toString();
    const pp = p.getPosition().toString();
    //@ts-ignore
    infoContainer.innerHTML +=
      "\n" +
      `<div style="filter: ${Player.createFilter(p.getHue(), 300)}">${
        Player.playerIcon
      }
  ${mv}
  ${av}
  ${pp}
  isOnFire: ${p.getIsOnFire()}
  health: ${p.getHealth()}
  </div>`;
  }
  //@ts-ignore
  infoContainer.innerHTML += `
Updateables: ${updateables.size}`;
  //@ts-ignore
  infoContainer.innerHTML += `
Positionables: ${positionables.size}`;
  updateGameState(timeStamp);
  render();
  lastAnimationFrameID = requestAnimationFrame(gameLoop);
  lastFrameTime = timeStamp;
}

function calcFPS(lastFrameTime: number, timestamp: number) {
  return lastFrameTime === undefined ? 0 : 1000 / (timestamp - lastFrameTime);
}

// Render

function render() {
  const [W, H] = getWH();

  for (const p of positionables) {
    const pos = p.getPosition();
    const x = W / 2 + pos[0];
    const y = H / 2 + pos[1];
    p.getDOMElement().style.transform = `translate(${x}px,${y}px)`;
    if (p instanceof Player) {
      p.getDOMElement().style.opacity = `${(p.getHealth() / 100)**2}`
    }
  }
}

// Game state

let lastSecond = 0;

function updateGameState(timeStamp: number) {
  let isSecond = false;

  if (timeStamp - lastSecond > 1000) {
    // A second has passed

    isSecond = true;
    lastSecond = timeStamp;
  }

  for (const player of players) {
    const pos = player.getPosition();
    const v: [
      number,
      number
    ] = player.getInputDevice().getMovementVector().getComponents();
    const positiveAimVector: [
      number,
      number
    ] = player
      .getInputDevice()
      .getAimVector()
      .toPositiveVector()
      .getComponents();
    player.setPosition([pos[0] + v[0], pos[1] + v[1]]);

    // Events that occur every second:

    if (isSecond) {
      if (player.getIsOnFire()) {
        player.damage(Fire.fireDamage);
      }
    }

    if (
      player.getInputDevice().getPrimaryActionButtonIsDown() &&
      (positiveAimVector[0] > 0 || positiveAimVector[1] > 0)
    ) {
      if (player.getPrimaryActionEquipable().canUse(timeStamp)) {
        player.getInputDevice().hapticFeedback();
        const thing = player.getPrimaryActionEquipable().use(player, timeStamp);
        positionables.add(thing);
        updateables.add(thing);
        gameContainer?.appendChild(thing.getDOMElement());
      }
    }

    if (
      player.getInputDevice().getSecondaryActionButtonIsDown() &&
      (positiveAimVector[0] > 0 || positiveAimVector[1] > 0)
    ) {
      if (player.getSecondaryActionEquipable().canUse(timeStamp)) {
        player.getInputDevice().hapticFeedback();
        const thing = player.getSecondaryActionEquipable().use(player, timeStamp);
        positionables.add(thing);
        updateables.add(thing);
        gameContainer?.appendChild(thing.getDOMElement());
      }
    }

  }

  const W = window.innerWidth;
  const H = window.innerHeight;

  for (const updateable of updateables) {
    updateable.update();
    const [x, y] = updateable.getPosition();
    if (x < -W / 2 || x > W / 2 || y < -H / 2 || y > H / 2) {
      const delFromPos = positionables.delete(updateable);
      const delFromUpds = updateables.delete(updateable);
      updateable.getDOMElement().remove();
      if (!delFromPos || !delFromUpds)
        console.log("Unable to remove unreachable updateable");
    }
  }
  for (const p of positionables) {
    for (const op of positionables) {
      // 💦 -> 🔥
      if (p instanceof Water && op instanceof Fire) {
        // Extinguish fire with water if they intersect
        if (p.intersectsWith(op)) {
          positionables.delete(p);
          positionables.delete(op);
          p.getDOMElement().remove();
          op.getDOMElement().remove();
          updateables.delete(p);
          break;
        }
      }

      // 🔥 -> 🐨
      if (p instanceof Fire && op instanceof Player) {
        // Set player on fire if they intersect fire

        if (p.intersectsWith(op)) {
          op.damage(Fire.impactDamage);
          if (!op.getIsOnFire()) {
            op.setOnFire();
            op.getDOMElement().textContent += Fire.fireIcon;
            break;
          }
        }
      }

      // 💦 -> 🐨
      if (p instanceof Water && op instanceof Player) {
        // Extinguish player if they intersect with water
        if (p.intersectsWith(op) && op.getIsOnFire()) {
          op.extinguish();
          op.getDOMElement().textContent = Player.playerIcon;
          positionables.delete(p);
          p.getDOMElement().remove();

          break;
        }
      }

      // 🌿 -> 🐨
      if (p instanceof Eucalyptus && op instanceof Player) {
        // Extinguish player if they intersect with water
        if (p.intersectsWith(op) && op.getHealth() < Player.initialHealth) {
          op.heal(Eucalyptus.healAmount);
          positionables.delete(p);
          p.getDOMElement().remove();

          break;
        }
      }
    }
  }
}

const players: Set<Player> = new Set();
const positionables: Set<Positionable> = new Set();
const updateables: Set<Updateable> = new Set();

init();
generateMap();
lastAnimationFrameID = requestAnimationFrame(gameLoop);

function createPlayer(inputDevice: InputDevice) {
  const player = new Player(inputDevice);
  gameContainer?.appendChild(player.getDOMElement());
  players.add(player);
  positionables.add(player);
}

function generateMap() {
  let fireCount = 50;
  let waterCount = 10;
  let treeCount = 200;
  let eucalyptusCount = 10;

  const [W, H] = getWH();

  for (let i = 0; i < fireCount; i++) {
    const [x, y] = generateRandomPos(W, H).getComponents();
    const fire = new Fire([x, y]);
    positionables.add(fire);
    gameContainer?.appendChild(fire.getDOMElement());
  }

  for (let i = 0; i < waterCount; i++) {
    const [x, y] = generateRandomPos(W, H).getComponents();
    const water = new Water([x, y], [0, 0]);
    positionables.add(water);
    gameContainer?.appendChild(water.getDOMElement());
  }

  for (let i = 0; i < treeCount; i++) {
    const [x, y] = generateRandomPos(W, H).getComponents();
    const tree = new Tree([x, y]);
    positionables.add(tree);
    gameContainer?.appendChild(tree.getDOMElement());
  }

  for (let i = 0; i < eucalyptusCount; i++) {
    const [x, y] = generateRandomPos(W, H).getComponents();
    const eucalyptus = new Eucalyptus([x, y]);
    positionables.add(eucalyptus);
    gameContainer?.appendChild(eucalyptus.getDOMElement());
  }
}

function generateRandomPos(maxX: number, maxY: number) {
  const x = randBetween(-maxX / 2, maxX / 2);
  const y = randBetween(-maxY / 2, maxY / 2);
  return new Vector2(x, y);
}

function getWH() {
  return [window.innerWidth, window.innerHeight];
}
