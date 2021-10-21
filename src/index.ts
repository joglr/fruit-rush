import {
  FRAMERATE_MIGRATION_DURATION,
  fruitMargin,
  fruitSpawnIntervalMilliseconds,
  gravityAmount,
  maxDisplaceables,
  pausedText,
  playerJumpAmount,
} from "./config"
import { playSFX } from "./modules/sound"
import { Poop } from "./modules/Equipables/PoopGun"
import { Food } from "./modules/Food"
import confetti from "canvas-confetti"
// import State from './modules/State'
// const state = State()
import init, { GamepadInput, KeyboardInput } from "./modules/InputDevice"
import { randBetween, randomInRange, Vector2 } from "./modules/Math"
import { Player } from "./modules/Player"
import "./style.css"
import { render } from "htm/preact"
import { getUI } from "./modules/ui"
import {
  createPlayer,
  displaceables,
  gameState,
  GameStatus,
  players,
} from "./modules/gameState"
import { getPlayersAlive, getWH } from "./modules/util"

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const uiContainer = document.querySelector("#gameui")! as HTMLDivElement
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const debugContainer = document.querySelector("#debug")!
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const canvas = document.querySelector("#gamecanvas")! as HTMLCanvasElement
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const ctx = canvas.getContext("2d")!

const DEBUG = window.location.hash.includes("debug")

// gameState.subscribe((s) => {
//   switch (s.status) {
//     case GameStatus.RUNNING: {
//       introContainer.style.display = "none"
//       break
//     }
//     case GameStatus.IDLE: {
//       introContainer.style.display = "initial"
//       break
//     }
//   }
// })

function resizeHandler() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
resizeHandler()
window.addEventListener("resize", resizeHandler)

let keyboardPlayerActive = false

function keydownHandler() {
  if (!keyboardPlayerActive) {
    keyboardPlayerActive = true
    const inputDevice = new KeyboardInput({
      xPos: ["d"],
      xNeg: ["a"],
      // yPos: ["s", ],
      // yNeg: [ "w" ],
      xPosAim: ["arrowright"],
      xNegAim: ["arrowleft"],
      yPosAim: ["arrowdown"],
      yNegAim: ["arrowup"],
      jumpKey: [" "],
      primaryActionKey: ["shift"],
      secondaryActionKey: ["control"],
    })
    createPlayer(inputDevice)
  }
}
window.addEventListener("keydown", keydownHandler)

window.addEventListener("gamepadconnected", (e: GamepadEvent) => {
  const inputDevice = new GamepadInput(e.gamepad.index)
  createPlayer(inputDevice)
})

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
  const deltaT = timeStamp - lastFrameTime
  updateGameState(timeStamp, deltaT)
  drawUI(timeStamp, deltaT)
  drawFrame(timeStamp)
  lastAnimationFrameID = requestAnimationFrame(gameLoop)
  lastFrameTime = timeStamp
}

function drawUI(timeStamp: number, deltaT: number) {
  if (DEBUG) {
    debugContainer.textContent = `fps ${calcFPS(
      lastFrameTime,
      timeStamp
    ).toFixed()}`
    debugContainer.textContent += ` (Δt = ${deltaT.toFixed(3)})`
  }

  render(getUI(players, gameState.getState().status), uiContainer)

  for (const p of players) {
    const mv = p.getInputDevice().getMovementVector()
    const mvs = mv.toArray().toString()

    const threeDecimals = (x: number) => x.toFixed(3)
    const av = p.getInputDevice().getAimVector().toArray().toString()
    const pp = p.getP().toArray().map(threeDecimals).toString()
    const pv = p.getV().toArray().map(threeDecimals).toString()
    const pa = p.getA().toArray().map(threeDecimals).toString()

    if (DEBUG)
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
  d: ${p.hasDiarrhea}
  health: ${p.getLives()}
  </div>`
  }

  if (DEBUG)
    debugContainer.innerHTML += `
Entities: ${displaceables.size}`
}

function calcFPS(lastFrameTime: number, timestamp: number) {
  return lastFrameTime === undefined ? 0 : 1000 / (timestamp - lastFrameTime)
}

// Render

function drawFrame(timeStamp: number) {
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, ...getWH())

  for (const d of displaceables) {
    if (DEBUG) d.drawWithHitBox(ctx, timeStamp)
    else d.draw(ctx, timeStamp)
  }
}

// Game state

let lastSecond = 0
let lastFruitSpawn = 0

function updateGameState(timeStamp: number, deltaT: number) {
  if (gameState.getState().status === GameStatus.RUNNING) {
    if (
      timeStamp - lastFruitSpawn > fruitSpawnIntervalMilliseconds &&
      displaceables.size < maxDisplaceables &&
      players.size > 0
    ) {
      lastFruitSpawn = timeStamp
      const [W] = getWH()

      if (gameState.getState().status === GameStatus.RUNNING) {
        const x = randBetween(fruitMargin, W - fruitMargin)
        const food = new Food(
          [x, -fruitMargin],
          [0, 0],
          [0, gravityAmount / 10]
        )
        displaceables.add(food)
      }
    }

    if (timeStamp - lastSecond > 1000) {
      // A second has passed

      lastSecond = timeStamp
    }
    const playersAlive = getPlayersAlive(players).length

    for (const p of players) {
      if (p.dead && p.justDied) {
        p.justDied = false

        if (playersAlive < 2) {
          gameState.setState((p) => ({
            ...p,
            status: GameStatus.GAME_OVER,
          }))
          gameState.setState(() => ({
            status: GameStatus.GAME_OVER,
          }))

          if (playersAlive === 1) {
            celebrate()
          }
        }
      }

      const positiveAimVector: [number, number] = p
        .getInputDevice()
        .getAimVector()
        .toPositiveVector()
        .toArray()

      // Player actions

      if (!p.dead) {
        if (p.getInputDevice().getJumpButtonIsDown()) {
          const [, H] = getWH()
          const [, h] = p.getDimensions()
          const distFromBottom = H - h / 2 - p.getP()[1]
          const canJump =
            distFromBottom < 5 && p.getVelocity()[1] === 0 && !p.dead

          if (canJump) {
            playSFX("jump")
            const jumpVector = new Vector2(0, playerJumpAmount)
            p.setVelocity(
              p
                .getV()
                .divide(FRAMERATE_MIGRATION_DURATION)
                .multiply(deltaT)
                .add(jumpVector)
            )
          }
        }

        if (
          p.getInputDevice().getPrimaryActionButtonIsDown()
          //  && (positiveAimVector[0] > 0 || positiveAimVector[1] > 0)
        ) {
          const thing = p.getPrimaryActionEquipable().use(p, timeStamp, deltaT)
          if (thing) {
            displaceables.add(thing)
          }
        }

        if (
          p.getInputDevice().getSecondaryActionButtonIsDown() &&
          (positiveAimVector[0] > 0 || positiveAimVector[1] > 0)
        ) {
          if (p.getSecondaryActionEquipable().canUse(timeStamp)) {
            p.getInputDevice().hapticFeedback()
            const thing = p.getSecondaryActionEquipable().use(p, timeStamp)
            displaceables.add(thing)
          }
        }
      }
    }

    const [W, H] = getWH()

    for (const d of displaceables) {
      d.update(deltaT)
      let [x, y] = d.getPosition()
      const [w, h] = d.getDimensions()

      // TODO: Handle collisions differently for food, players and projectiles

      const factor = d instanceof Food || d instanceof Poop ? -1 : 1
      const xOffset = (factor * w) / 2
      const yOffset = (factor * h) / 2

      const minX = xOffset
      const minY = yOffset
      const maxX = W - xOffset
      const maxY = H - yOffset

      const xCollision = x < minX || x > maxX
      const yCollision = y < minY || y > maxY

      if (xCollision || yCollision) {
        if (d instanceof Player) {
          let [vx, vy] = d.getV()
          if (xCollision) {
            vx *= -1
            if (x < W / 2) x = minX
            else x = maxX
          }
          if (yCollision) {
            if (y > maxY) {
              y = maxY
              vy = 0
              vx *= 0.7
            }
          }
          const v = new Vector2(vx, vy)
          const p = new Vector2(x, y)

          if (!v.is(d.getV())) d.setVelocity(v)
          if (!p.is(d.getP())) d.setPosition(p)
        } else {
          // Delete non-players when colliding with the ground
          if (d instanceof Food && y < minY) continue
          // TODO: Recycle Food, but at new positions
          const delFromPos = displaceables.delete(d)
          if (!delFromPos)
            console.log("Unable to remove unreachable displaceable")
        }
      }
      for (const od of displaceables) {
        if (od instanceof Player && od.dead) {
          continue
        }
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
        // if (d instanceof Fire && od instanceof Player) {
        // Set player on fire if they intersect fire
        // if (p.intersectsWith(op)) {
        //   op.damage(Fire.impactDamage);
        //   if (!op.getIsOnFire()) {
        //     op.setOnFire();
        //     break;
        //   }
        // }
        // }

        // 💩 -> 🐵
        if (d instanceof Poop && od instanceof Player) {
          // Stun player if they intersect with poop
          if (d.intersectsWith(od) && !od.isStunned) {
            od.stun()
            displaceables.delete(d)
            break
          }
        }

        // Food -> 🐵
        if (d instanceof Food && od instanceof Player) {
          // Affect player by the consumed food
          if (d.intersectsWith(od)) {
            d.affect(od)
            displaceables.delete(d)
            break
          }
        }
      }
    }
  }
}

init()

lastAnimationFrameID = requestAnimationFrame(gameLoop)

function celebrate() {
  const duration = 15 * 1000
  const animationEnd = Date.now() + duration
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 0,
  }

  const interval = window.setInterval(function () {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 50 * (timeLeft / duration)
    // since particles fall down, start a bit higher than random
    confetti({
      ...defaults,
      particleCount,
      origin: {
        x: randomInRange(0.1, 0.3),
        y: Math.random() - 0.2,
      },
    })
    confetti({
      ...defaults,
      particleCount,
      origin: {
        x: randomInRange(0.7, 0.9),
        y: Math.random() - 0.2,
      },
    })
  }, 250)
}
