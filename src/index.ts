import {
  FRAMERATE_MIGRATION_DURATION,
  fruitMargin,
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
import init, {
  GamepadInput,
  KeyboardInput,
  keyboardInputInstance,
} from "./modules/InputDevice"
import { randBetween, randomInRange, Vector2 } from "./modules/Math"
import { Player, PlayerState } from "./modules/Player"
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
import { getFoodSpawnRate, getPlayersAlive, getWH } from "./modules/util"
import { DEBUG, loadGitMetadata } from "./modules/debug"

loadGitMetadata()

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const uiContainer = document.querySelector("#gameui")! as HTMLDivElement
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const canvas = document.querySelector("#gamecanvas")! as HTMLCanvasElement
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const ctx = canvas.getContext("2d")!

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

function keydownHandler(e: KeyboardEvent) {
  if (e.key === "Enter" || e.key.toUpperCase() === "P") {
    if (lastAnimationFrameID === null) {
      continueGame()
    } else {
      pauseGame()
    }
  } else if (e.key === "Escape") {
    // debugger
    for (const p of players) {
      if (p.getInputDevice() instanceof KeyboardInput) {
        p.destroy()
        players.delete(p)
        displaceables.delete(p)
        break
      }
    }
  } else if (!keyboardInputInstance) {
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
      p.destroy()
      players.delete(p)
      displaceables.delete(p)
    }
  }
})

let lastAnimationFrameID: number | null = null
let lastFrameTime = 0
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    pauseGame()
  } else {
    continueGame()
  }
})

function continueGame() {
  lastAnimationFrameID = requestAnimationFrame(gameLoop)
  document.title = document.title.replace(pausedText, "")
}

function pauseGame() {
  if (lastAnimationFrameID !== null) {
    cancelAnimationFrame(lastAnimationFrameID)
    lastAnimationFrameID = null
    lastFrameTime = 0
    document.title += pausedText
  }
}

function gameLoop(timeStamp: number) {
  const deltaT = lastFrameTime === 0 ? 0 : timeStamp - lastFrameTime
  updateGameState(timeStamp, deltaT)
  drawUI(timeStamp, deltaT)
  drawFrame(timeStamp)
  lastAnimationFrameID = requestAnimationFrame(gameLoop)
  lastFrameTime = timeStamp
}

function drawUI(timeStamp: number, deltaT: number) {
  render(
    getUI(
      timeStamp,
      lastFrameTime,
      deltaT,
      players,
      gameState.getState().status
    ),
    uiContainer
  )
}

// Render

function drawFrame(timeStamp: number) {
  ctx.fillStyle = "hsl(100, 30%, 20%)"
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
      timeStamp - lastFruitSpawn > getFoodSpawnRate(players.size) &&
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
          p.getInputDevice().getPrimaryActionButtonIsDown() ||
          //  && (positiveAimVector[0] > 0 || positiveAimVector[1] > 0)
          p.state === PlayerState.DIARRHEA
        ) {
          const thing = p.getPrimaryActionEquipable().use(p, timeStamp, deltaT)
          if (thing) {
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
        if (
          od instanceof Player &&
          od.state !== PlayerState.DEFAULT &&
          od.state !== PlayerState.EAT
        ) {
          continue
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
