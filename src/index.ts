// import State from './modules/State'
// import Gamepad from './modules/Gamepad'
// const state = State()

import init, {
  KeyboardInput,
  InputDevice,
  GamepadInput,
} from './modules/InputDevice.js'
import { Player } from './modules/Player.js'
import { Positionable } from './modules/Positionable.js'
import { Fire } from './modules/Fire.js'

init()

const mapConfig = {
  areaSize: 16,
  modelSize: 16,
  imageSize: 12,
}

const gameContainer = document.querySelector('#game')
const infoContainer = document.querySelector('#info')
let lastAnimationFrameID
// let inputDevice: InputDevice

// @ts-ignore
window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
  const inputDevice = new GamepadInput(e.gamepad.index)
  createPlayer(inputDevice)
})

let keyboardPlayerActive: boolean = false
window.addEventListener('keydown', () => {
  if (!keyboardPlayerActive) {
    const inputDevice = new KeyboardInput(
      ['arrowright', 'd'],
      ['arrowleft', 'a'],
      ['arrowdown', 's'],
      ['arrowup', 'w']
    )
    createPlayer(inputDevice)
  }
  keyboardPlayerActive = true
})

// @ts-ignore
window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
  // TODO: Test this with non-steam controller
  for (const p of players) {
    const gp = p.getInputDevice() as GamepadInput
    if (gp.getGamepadIndex() === e.gamepad.index) {
      p.getDOMElement().remove()
      players.delete(p)
    }
  }
})

window.addEventListener('click', (e) => {
  const W = window.innerWidth
  const H = window.innerHeight
  const fire = new Fire([e.pageX - W / 2, e.pageY - H / 2])
  gameContainer?.appendChild(fire.getDOMElement())
  positionables.add(fire)
})

let lastFrameTime: number

function gameLoop(timeStamp: number) {
  // @ts-ignore
  infoContainer.textContent = `fps ${calcFPS(
    lastFrameTime,
    timeStamp
  ).toFixed()}`

  for (const p of players) {
    const mv = p.getInputDevice().getMovementVector().toString()
    //@ts-ignore
    infoContainer.innerHTML +=
      '\n' +
      `<span style="filter: ${Player.createFilter(p.getHue(), 300)}">${
        Player.playerIcon
      }: ${mv}</span>`
  }
  updateGameState()
  render()
  requestAnimationFrame(gameLoop)
  lastFrameTime = timeStamp
}

function calcFPS(lastFrameTime: number, timestamp: number) {
  return lastFrameTime === undefined ? 0 : 1000 / (timestamp - lastFrameTime)
}

// Render

function render() {
  const W = window.innerWidth
  const H = window.innerHeight
  for (const p of positionables) {
    const pos = p.getPosition()
    const x = W / 2 + pos[0]
    const y = H / 2 + pos[1]
    p.getDOMElement().style.transform = `translate(${x}px,${y}px)`
  }
}

// Game state

function updateGameState() {
  for (const player of players) {
    const pos = player.getPosition()
    const v: [number, number] = player.getInputDevice().getMovementVector()
    player.setPosition([pos[0] + v[0], pos[1] + v[1]])
  }
}

// let players: Player[] = []
const players: Set<Player> = new Set()
const positionables: Set<Positionable> = new Set()

lastAnimationFrameID = requestAnimationFrame(gameLoop)

function createPlayer(inputDevice: InputDevice) {
  const player = new Player(inputDevice)
  gameContainer?.appendChild(player.getDOMElement())
  players.add(player)
  positionables.add(player)
}
