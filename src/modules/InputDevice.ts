// enum InputDeviceType {
//   GAMEPAD,
//   KEYBOARD
// }

export interface InputDevice {
  getMovementVector()
}

export class GamepadInput implements InputDevice {
  gamepadIndex: number
  getMovementVector(): [number, number] {
    throw new Error('Method not implemented.')
  }

  constructor(gamepadIndex) {
    this.gamepadIndex = gamepadIndex
  }
}

const downKeys = {}

export class KeyboardInput implements InputDevice {
  xPos: string[]
  xNeg: string[]
  yPos: string[]
  yNeg: string[]

  constructor(xPos: string[], xNeg: string[], yPos: string[], yNeg: string[]) {
    this.xPos = xPos
    this.xNeg = xNeg
    this.yPos = yPos
    this.yNeg = yNeg
  }

  getMovementVector() : [number, number] {
    return [
      (Object.keys(downKeys).includes(xPos) ? 1 : 0) + (Object.keys(downKeys)].includes(xNeg) ? -1 : 0),
      (Object.keys(downKeys).includes(yPos) ? 1 : 0) + (Object.keys(downKeys)].includes(yNeg) ? -1 : 0)
    ]
  }
}

export default function init(callback: Function) {
  window.addEventListener('keydown', (evt) => {
    downKeys[evt.key.toLowerCase()] = true
    callback()
  })
  window.addEventListener('keyup', (evt) => {
    delete downKeys[evt.key.toLowerCase()]
  })
}
