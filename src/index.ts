// import State from './modules/State'
// import Gamepad from './modules/Gamepad'
// const state = State()

import init, {
  KeyboardInput,
  InputDevice,
  GamepadInput,
} from './modules/InputDevice.js'

init()

const mapConfig = {
  areaSize: 16,
  modelSize: 16,
  imageSize: 12,
}

const playerIcon = '🐨'
const gameContainer = document.querySelector('#game')
const infoContainer = document.querySelector('#info')
let lastAnimationFrameID
// let inputDevice: InputDevice

// @ts-ignore
window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
  console.log('new player')
  const inputDevice = new GamepadInput(e.gamepad.index)
  const playerElement = createPlayerElement()
  //@ts-ignore
  gameContainer.appendChild(playerElement)
  players.push(new Player(inputDevice, playerElement))
})

let keyboardPlayerActive: boolean = false
window.addEventListener('keydown', () => {
  if (!keyboardPlayerActive) activateKeyboardPlayer()
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
    //@ts-ignore
    infoContainer.textContent += `
p${players.indexOf(p)}: ${p.getInputDevice().getMovementVector().toString()}`
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
  for (const player of players) {
    const pos = player.getPosition()
    player.getDOMElement().style.transform = `translate(${pos[0]}px,${pos[1]}px)`
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

class Player {
  private inputDevice: InputDevice
  private position: [number, number]
  private DOMElement: HTMLElement

  constructor(inputDevice: InputDevice, domElement: HTMLElement) {
    this.inputDevice = inputDevice
    this.position = [0, 0]
    this.DOMElement = domElement
  }

  getInputDevice() {
    return this.inputDevice
  }

  getPosition(): [number, number] {
    return this.position
  }

  getDOMElement(): HTMLElement {
    return this.DOMElement
  }

  setPosition(position: [number, number]) {
    this.position = position
  }
}

function createPlayerElement() {
  const playerElement = document.createElement('div')
  playerElement.textContent = playerIcon
  playerElement.style.display = 'inline-block'
  return playerElement
}

function activateKeyboardPlayer() {
  const inputDevice = new KeyboardInput(
    ['arrowright', 'd'],
    ['arrowleft', 'a'],
    ['arrowdown', 's'],
    ['arrowup', 'w']
  )
  const playerElement = createPlayerElement()
  //@ts-ignore
  gameContainer.appendChild(playerElement)
  players.push(new Player(inputDevice, playerElement))
}
