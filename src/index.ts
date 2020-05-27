// import State from './modules/State'
// import Gamepad from './modules/Gamepad'
// const state = State()

import init, {
  KeyboardInput,
  InputDevice,
  GamepadInput,
} from './modules/InputDevice.js'

init(activateKeyboardPlayer)

function activateKeyboardPlayer() {
  inputDevice = new KeyboardInput('d', 'a', 's', 'w')
  // inputDevice = new KeyboardInput('left', 'right', 'down', 'up')
}

const mapConfig = {
  areaSize: 16,
  modelSize: 16,
  imageSize: 12,
}

const playerIcon = '🐨'
const gameContainer = document.querySelector('#game')
const infoContainer = document.querySelector('#info')
let lastAnimationFrameID
let inputDevice: InputDevice = null

const playerElement = document.createElement('div')
playerElement.textContent = playerIcon

gameContainer.appendChild(playerElement)

window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
  inputDevice = new GamepadInput(e.gamepad.index)
  lastAnimationFrameID = requestAnimationFrame(gameLoop)
})

window.addEventListener('keydown', () => {
  activateKeyboardPlayer()
  lastAnimationFrameID = requestAnimationFrame(gameLoop)
})

window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
  inputDevice = null
  cancelAnimationFrame(lastAnimationFrameID)
})

function gameLoop() {
  infoContainer.textContent = inputDevice.getMovementVector().toString()
  updateGameState(inputDevice)
  render()
  requestAnimationFrame(gameLoop)
}

// Render

function render() {
  playerElement.style.transform = `translate(${playerPosition[0]}px,${playerPosition[1]}px)`
}

// Game state

function updateGameState(inputDevice: InputDevice) {
  const v: [number, number] = inputDevice.getMovementVector()
  movePlayerRelatively(v[0], v[1])
}

let playerPosition: [number, number]

playerPosition = [0, 0]

function movePlayerRelatively(dx: number, dy: number) {
  playerPosition[0] += dx
  playerPosition[1] += dy
}
