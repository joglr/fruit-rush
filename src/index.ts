// import State from './modules/State'
// import Gamepad from './modules/Gamepad'
// const state = State()

import init, {
  KeyboardInput,
  InputDevice,
  GamepadInput,
} from './modules/InputDevice.js'
import { Player } from './modules/Player.js'

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
  for (const p of players) {
    if (p.getInputDevice()) {
      //
    }
  }
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
      `<span style="filter: ${Player.createFilter(p.getHue())}">${
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
  for (const player of players) {
    const pos = player.getPosition()
    const x = W / 2 + pos[0]
    const y = H / 2 + pos[1]
    player.getDOMElement().style.transform = `translate(${x}px,${y}px)`
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

let players: Player[] = []

lastAnimationFrameID = requestAnimationFrame(gameLoop)

function createPlayer(inputDevice: InputDevice) {
  const player = new Player(inputDevice)
  //@ts-ignore
  gameContainer.appendChild(player.getDOMElement())
  players.push(player)
}
