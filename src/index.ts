import './style.css'
// import State from './modules/State'
// import Gamepad from './modules/Gamepad'
// const state = State()

import init, {
  KeyboardInput,
  InputDevice,
  GamepadInput,
} from "./modules/InputDevice";
import { Player } from "./modules/Player";
import { Displaceable } from "./modules/Displaceable";
import { randBetween, Vector2 } from "./modules/Math";
import { Tree } from "./modules/Tree";
import { Water } from "./modules/Equipables/WaterGun";
import { Eucalyptus } from "./modules/Eucalyptus";
import { POSITIONABLE_SIZE } from "./modules/settings";
import { Fire } from "./modules/Equipables/NotAFlameThrower";

document.documentElement.style.setProperty('--positionableSize', `${POSITIONABLE_SIZE}px`)

const mapConfig = {
  areaSize: 16,
  modelSize: 16,
  imageSize: 12,
};

const gameContainer = document.querySelector("#game")!;
const infoContainer = document.querySelector("#info")!;
const canvas = document.querySelector("#game > canvas")! as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

canvas.width = window.innerWidth
canvas.height = window.innerHeight

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
      players.delete(p);
    }
  }
});

// window.addEventListener("click", (e) => {
//   const W = window.innerWidth;
//   const H = window.innerHeight;
//   const fire = new Fire([e.pageX - W / 2, e.pageY - H / 2]);
//   positionables.add(fire);
// });

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
  infoContainer.textContent = `fps ${calcFPS(
    lastFrameTime,
    timeStamp
  ).toFixed()} (${Math.round(timeStamp)})`;

  const flooredTimeStamp = Math.round(timeStamp);



  // Interval events
  // if (flooredTimeStamp % 100 === 0 && positionables.size < 400) {
  //   const [W, H] = getWH();

  //   let [x, y] = generateRandomPos(W, H).getComponents();
  //   const fire = new Fire([x, y]);
  //   positionables.add(fire);
  //   gameContainer?.appendChild(fire.getDOMElement());

  //   [x, y] = generateRandomPos(W, H).getComponents();
  //   const water = new Water([x, y], [0,0]);
  //   positionables.add(water);
  //   gameContainer?.appendChild(water.getDOMElement());

  //   [x, y] = generateRandomPos(W, H).getComponents();
  //   const eucalyptus = new Eucalyptus([x, y]);
  //   positionables.add(eucalyptus);
  //   gameContainer?.appendChild(eucalyptus.getDOMElement());


  // }

  for (const p of players) {
    // p.icon = "😀"
    const mv = p
      .getInputDevice()
      .getMovementVector()

    const mvs = mv
      .toArray()
      .toString();

    const threeDecimals = (x : number) => x.toFixed(3)
    const av = p.getInputDevice().getAimVector().toArray().toString();
    const pp = p.getP().toArray().map(threeDecimals).toString();
    const pv = p.getV().toArray().map(threeDecimals).toString();
    const pa = p.getA().toArray().map(threeDecimals).toString();
    //@ts-ignore
    infoContainer.innerHTML +=
      "\n" +
      `<div style="filter: ${Player.createFilter(p.getHue(), 300)}">${
        p.icon
      }
  ${mvs} l: ${mv.getMagnitude()}
  aim: ${av}
  p: ${pp}
  v: ${pv}
  a: ${pa}
  isOnFire: ${p.getIsOnFire()}
  health: ${p.getHealth()}
  </div>`;
  }
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

  ctx.fillStyle = "#000";
  ctx.fillRect(0,0, ...getWH())

  for (const p of positionables) {
    // const pos = p.getPosition();
    // const x = W / 2 + pos[0];
    // const y = H / 2 + pos[1];

    // p.draw(ctx)
    p.drawWithHitbox(ctx)
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
    ] = player.getInputDevice().getMovementVector().toArray();
    const positiveAimVector: [
      number,
      number
    ] = player
      .getInputDevice()
      .getAimVector()
      .toPositiveVector()
      .toArray();

    // Events that occur every second:

    if (isSecond) {
      if (player.getIsOnFire()) {
        player.damage(Fire.fireDamage);
      }
    }

    if (
      player.getInputDevice().getPrimaryActionButtonIsDown()
      //  && (positiveAimVector[0] > 0 || positiveAimVector[1] > 0)
    ) {

      const [,H] = getWH()
      const [,h] = player.getDimensions()
      const distFromBottom = H - (h / 2) - player.getP()[1]
      console.log({distFromBottom})
      const canJump = distFromBottom < 5 && player.getVelocity()[1] === 0
      console.log(H - h / 2)
      console.log(player.getP()[1])
      console.log(canJump)
      if (canJump)  {
        player.setVelocity(player.getV().add(new Vector2(0,-5)))
      }

      // if (player.getPrimaryActionEquipable().canUse(timeStamp)) {
      //   player.getInputDevice().hapticFeedback();
      //   const thing = player.getPrimaryActionEquipable().use(player, timeStamp);
      //   positionables.add(thing);
      // }
    }

    if (
      player.getInputDevice().getSecondaryActionButtonIsDown() &&
      (positiveAimVector[0] > 0 || positiveAimVector[1] > 0)
    ) {
      if (player.getSecondaryActionEquipable().canUse(timeStamp)) {
        player.getInputDevice().hapticFeedback();
        const thing = player.getSecondaryActionEquipable().use(player, timeStamp);
        positionables.add(thing);
      }
    }

  }

  const W = window.innerWidth;
  const H = window.innerHeight;

  for (const p of positionables) {
    p.update();
    const [x, y] = p.getPosition();
    const [w, h] = p.getDimensions();

    let xCollision = x < w / 2 || x > W - w / 2
    let yCollision = y < h / 2 || y > H - h / 2
    if (xCollision || yCollision) {
      if (p instanceof Player) {
        let [vx, vy] = p.getV()
        if (xCollision) {
          vx *= -1
        }
        if (yCollision) {
          vy = 0;
          // if ()
        }
        const v = Vector2.fromArray([vx, vy])
          // .multiply(0.9);
        if (!v.is(p.getV())) p.setVelocity(v)
      }
      // const delFromPos = positionables.delete(p);
      // if (!delFromPos) console.log("Unable to remove unreachable updateable");
    }
    for (const op of positionables) {
      // 💦 -> 🔥
      if (p instanceof Water && op instanceof Fire) {
        // Extinguish fire with water if they intersect
        if (p.intersectsWith(op)) {
          positionables.delete(p);
          positionables.delete(op);
          break;
        }
      }

      // 🔥 -> 🐨
      if (p instanceof Fire && op instanceof Player) {
        // Set player on fire if they intersect fire

        // if (p.intersectsWith(op)) {
        //   op.damage(Fire.impactDamage);
        //   if (!op.getIsOnFire()) {
        //     op.setOnFire();
        //     break;
        //   }
        // }
      }

      // 💦 -> 🐨
      if (p instanceof Water && op instanceof Player) {
        // Extinguish player if they intersect with water
        // if (p.intersectsWith(op) && op.getIsOnFire()) {
        //   op.extinguish();
        //   positionables.delete(p);

        //   break;
        // }
      }

      // 🌿 -> 🐨
      if (p instanceof Eucalyptus && op instanceof Player) {
        // Heal player if they intersect with Eucalyptus
        if (p.intersectsWith(op) && op.getHealth() < Player.initialHealth) {
          op.heal(Eucalyptus.healAmount);
          positionables.delete(p);

          break;
        }
      }
    }
  }
}

const players: Set<Player> = new Set();
const positionables: Set<Displaceable> = new Set();

init();
// generateMap();
lastAnimationFrameID = requestAnimationFrame(gameLoop);

function createPlayer(inputDevice: InputDevice) {
  const player = new Player(inputDevice);
  player.setPosition(Vector2.fromArray(getWH().map(x => x / 2)))
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
    const [x, y] = generateRandomPos(W, H).toArray();
    const fire = new Fire([x, y]);
    positionables.add(fire);
  }

  for (let i = 0; i < waterCount; i++) {
    const [x, y] = generateRandomPos(W, H).toArray();
    const water = new Water([x, y], [0, 0]);
    positionables.add(water);
  }

  for (let i = 0; i < treeCount; i++) {
    const [x, y] = generateRandomPos(W, H).toArray();
    const tree = new Tree([x, y]);
    positionables.add(tree);
  }

  for (let i = 0; i < eucalyptusCount; i++) {
    const [x, y] = generateRandomPos(W, H).toArray();
    const eucalyptus = new Eucalyptus([x, y]);
    positionables.add(eucalyptus);
  }
}

function generateRandomPos(maxX: number, maxY: number) {
  const x = randBetween(-maxX / 2, maxX / 2);
  const y = randBetween(-maxY / 2, maxY / 2);
  return new Vector2(x, y);
}

function getWH() : [number, number] {
  return [window.innerWidth, window.innerHeight];
}
