import { gravityAmount, pausedText, playerJumpAmount } from "./config"
import { playSFX } from "./modules/sound"
import { Displaceable } from "./modules/Displaceable"
import { Fire } from "./modules/Equipables/NotAFlameThrower"
import { Poop } from "./modules/Equipables/PoopGun"
import { Food } from "./modules/Food"
// import State from './modules/State'
// const state = State()
import init, {
  GamepadInput, InputDevice, KeyboardInput
} from "./modules/InputDevice"
import { randBetween, Vector2 } from "./modules/Math"
import { Player } from "./modules/Player"
import "./style.css"

// const gameContainer = document.querySelector("#game")!;
const debugContainer = document.querySelector("#debug")!
const scoreboardContainer = document.querySelector("#scoreboard")!
const canvas = document.querySelector("#game > canvas")! as HTMLCanvasElement
const ctx = canvas.getContext("2d")!


function resizeHandler() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
resizeHandler()
window.addEventListener("resize", resizeHandler)

let keyboardPlayerActive = false


function keydownHandler(event: KeyboardEvent) {
  if (!keyboardPlayerActive) {
    keyboardPlayerActive = true
    const inputDevice = new KeyboardInput({
      xPos: ["d"],
      xNeg: ["a"],
      // yPos: ["s", ],
      yNeg: [
        /*"w"*/
      ],
      xPosAim: ["arrowright"],
      xNegAim: ["arrowleft"],
      yPosAim: ["arrowdown"],
      yNegAim: ["arrowup"],
      jumpKey: ["w"],
      primaryActionKey: [" "],
      secondaryActionKey: ["shift"],
    })
    createPlayer(inputDevice)
  }
}
window.addEventListener("keydown", keydownHandler)

// @ts-ignore
window.addEventListener("gamepadconnected", (e: GamepadEvent) => {
  const inputDevice = new GamepadInput(e.gamepad.index)
  createPlayer(inputDevice)
})

// @ts-ignore
window.addEventListener("gamepaddisconnected", (e: GamepadEvent) => {
  for (const p of players) {
    const gp = p.getInputDevice() as GamepadInput
    if (gp.getGamepadIndex() === e.gamepad.index) {
      players.delete(p)
    }
  }
})

let lastAnimationFrameID: number
let lastFrameTime: number
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    cancelAnimationFrame(lastAnimationFrameID)
    document.title += pausedText
  } else {
    requestAnimationFrame(gameLoop)
    document.title = document.title.replace(pausedText, "")
  }
})

function gameLoop(timeStamp: number) {
  debugContainer.textContent = `fps ${calcFPS(
    lastFrameTime,
    timeStamp
  ).toFixed()} (${Math.round(timeStamp)})`

  const flooredTimeStamp = Math.round(timeStamp / 15)

  // Interval events
  if (
    flooredTimeStamp % 50 === 0 &&
    displaceables.size < 400 &&
    players.size > 0
  ) {
    const [W] = getWH()

    //   let [x, y] = generateRandomPos(W, H).getComponents();
    //   const fire = new Fire([x, y]);
    //   positionables.add(fire);
    //   gameContainer?.appendChild(fire.getDOMElement());

    //   [x, y] = generateRandomPos(W, H).getComponents();
    //   const water = new Water([x, y], [0,0]);
    //   positionables.add(water);
    //   gameContainer?.appendChild(water.getDOMElement());
    const margin = 50

    const x = randBetween(margin, W - margin)
    const food = new Food([0, gravityAmount / 10], [0, 0], [x, margin])
    displaceables.add(food)
  }

  for (const p of players) {
    if (p.dead) {
      // TODO: Handle dead player
    }
    const scoreContainer =
      scoreboardContainer.children[Array.from(players).indexOf(p)]

    scoreContainer.textContent = `${p
      .getScore()
      .toString()}💩 ${p.getHealth()}❤`

    const mv = p.getInputDevice().getMovementVector()

    const mvs = mv.toArray().toString()

    const threeDecimals = (x: number) => x.toFixed(3)
    const av = p.getInputDevice().getAimVector().toArray().toString()
    const pp = p.getP().toArray().map(threeDecimals).toString()
    const pv = p.getV().toArray().map(threeDecimals).toString()
    const pa = p.getA().toArray().map(threeDecimals).toString()
    //@ts-ignore
    debugContainer.innerHTML +=
      "\n" +
      `<div style="filter: ${Player.createFilter(p.getHue(), 300)}">${p.icon}
  ${mvs} l: ${mv.getMagnitude()}
  aim: ${av}
  p: ${pp}
  v: ${pv}
  a: ${pa}
  j: ${p.getInputDevice().getJumpButtonIsDown()}
  s: ${p.isStunned}
  isOnFire: ${p.getIsOnFire()}
  health: ${p.getHealth()}
  </div>`
  }
  //@ts-ignore
  debugContainer.innerHTML += `
Positionables: ${displaceables.size}`
  updateGameState(timeStamp)
  drawFrame(timeStamp)
  lastAnimationFrameID = requestAnimationFrame(gameLoop)
  lastFrameTime = timeStamp
}

function calcFPS(lastFrameTime: number, timestamp: number) {
  return lastFrameTime === undefined ? 0 : 1000 / (timestamp - lastFrameTime)
}

// Render

function drawFrame(timeStamp: number) {
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, ...getWH())

  for (const p of displaceables) {
    p.draw(ctx, timeStamp)
    // p.drawWithHitBox(ctx)
  }
}

// Game state

let lastSecond = 0

function updateGameState(timeStamp: number) {
  let isSecond = false

  if (timeStamp - lastSecond > 1000) {
    // A second has passed

    isSecond = true
    lastSecond = timeStamp
  }

  for (const player of players) {
    const positiveAimVector: [number, number] = player
      .getInputDevice()
      .getAimVector()
      .toPositiveVector()
      .toArray()

    // Events that occur every second:

    if (isSecond) {
      // TODO: Refactor modulo based events to us diffing instead
      if (player.getIsOnFire()) {
        player.damage(Fire.fireDamage)
      }
    }

    if (player.getInputDevice().getJumpButtonIsDown()) {
      const [, H] = getWH()
      const [, h] = player.getDimensions()
      const distFromBottom = H - h / 2 - player.getP()[1]
      const canJump = distFromBottom < 5 && player.getVelocity()[1] === 0

      if (canJump) {
        playSFX("jump")
        const jumpVector = new Vector2(0, playerJumpAmount)
        player.setVelocity(player.getV().add(jumpVector))
      }
    }

    if (
      player.getInputDevice().getPrimaryActionButtonIsDown() &&
      (positiveAimVector[0] > 0 || positiveAimVector[1] > 0)
    ) {
      const thing = player.getPrimaryActionEquipable().use(player, timeStamp)
      if (thing) {
        displaceables.add(thing)
      }
    }

    if (
      player.getInputDevice().getSecondaryActionButtonIsDown() &&
      (positiveAimVector[0] > 0 || positiveAimVector[1] > 0)
    ) {
      if (player.getSecondaryActionEquipable().canUse(timeStamp)) {
        player.getInputDevice().hapticFeedback()
        const thing = player
          .getSecondaryActionEquipable()
          .use(player, timeStamp)
        displaceables.add(thing)
      }
    }
  }

  const W = window.innerWidth
  const H = window.innerHeight

  for (const d of displaceables) {
    d.update()
    const [x, y] = d.getPosition()
    const [w, h] = d.getDimensions()

    // TODO: Handle collisions differently for food, players and projectiles
    let xCollision = x < w / 2 || x > W - w / 2
    let yCollision = y < h / 2 || y > H - h / 2

    if (xCollision || yCollision) {
      if (d instanceof Player) {
        let [vx, vy] = d.getV()
        if (xCollision) {
          vx *= -1
        }
        if (yCollision) {
          vy = 0
          vx *= 0.7
        }
        const v = Vector2.fromArray([vx, vy])
        // .multiply(0.9);
        if (!v.is(d.getV())) d.setVelocity(v)
      } else {
        // Delete non-players when colliding with the ground
        const delFromPos = displaceables.delete(d)
        if (!delFromPos) console.log("Unable to remove unreachable displaceable")
      }
    }
    for (const od of displaceables) {
      // // 💦 -> 🔥
      // if (d instanceof Poop && op instanceof Fire) {
      //   // Extinguish fire with water if they intersect
      //   if (d.intersectsWith(op)) {
      //     displaceables.delete(d)
      //     displaceables.delete(op)
      //     break
      //   }
      // }

      // 🔥 -> 🐵
      if (d instanceof Fire && od instanceof Player) {
        // Set player on fire if they intersect fire
        // if (p.intersectsWith(op)) {
        //   op.damage(Fire.impactDamage);
        //   if (!op.getIsOnFire()) {
        //     op.setOnFire();
        //     break;
        //   }
        // }
      }

      // 💩 -> 🐵
      if (d instanceof Poop && od instanceof Player) {
        // Stun player if they intersect with poop
        if (d.intersectsWith(od)) {
          od.stun()
          displaceables.delete(d)
          break
        }
      }

      // 🍌 -> 🐵
      if (d instanceof Food && od instanceof Player) {
        // Heal player if they intersect with Eucalyptus
        if (
          d.intersectsWith(od)
          //  && op.getHealth() < Player.initialHealth
        ) {
          // if (BAD.includes(d.icon)) {
          //   od.hasDiarrhea = true
          //   setTimeout(() => {
          //     od.hasDiarrhea = false;
          //   }, 2000)
          //   // playSFX("kebab")
          //   // TODO: Dihrearea
          // }
          od.eat(1)
          displaceables.delete(d)

          break
        }
      }
    }
  }
}

const players: Set<Player> = new Set()
const displaceables: Set<Displaceable> = new Set()

init()
// generateMap();
lastAnimationFrameID = requestAnimationFrame(gameLoop)

function createPlayer(inputDevice: InputDevice) {
  const player = new Player(players.size, inputDevice)
  player.setPosition(Vector2.fromArray(getWH().map((x) => x / 2)))
  players.add(player)
  const playerScore = document.createElement("div")
  playerScore.style.color = player.getColor()
  scoreboardContainer.appendChild(playerScore)

  displaceables.add(player)
}

// function generateMap() {
//   let fireCount = 50
//   let waterCount = 10
//   let treeCount = 200
//   let eucalyptusCount = 10

//   const [W, H] = getWH()

//   for (let i = 0; i < fireCount; i++) {
//     const [x, y] = generateRandomPos(W, H).toArray()
//     const fire = new Fire([x, y])
//     displaceables.add(fire)
//   }

//   for (let i = 0; i < waterCount; i++) {
//     const [x, y] = generateRandomPos(W, H).toArray()
//     const water = new Poop([x, y], [0, 0])
//     displaceables.add(water)
//   }

//   for (let i = 0; i < treeCount; i++) {
//     const [x, y] = generateRandomPos(W, H).toArray()
//     const tree = new Tree([x, y])
//     displaceables.add(tree)
//   }

//   for (let i = 0; i < eucalyptusCount; i++) {
//     const [x, y] = generateRandomPos(W, H).toArray()
//     const food = new Food([x, y])
//     displaceables.add(food)
//   }
// }

// function generateRandomPos(maxX: number, maxY: number) {
//   const x = randBetween(-maxX, maxX)
//   const y = randBetween(-maxY, maxY)
//   return new Vector2(x, y)
// }

function getWH(): [number, number] {
  return [window.innerWidth, window.innerHeight]
}
