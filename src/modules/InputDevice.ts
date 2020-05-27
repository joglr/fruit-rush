// enum InputDeviceType {
//   GAMEPAD,
//   KEYBOARD
// }

export interface InputDevice {
  getMovementVector()
}

let initialized = false

export class GamepadInput implements InputDevice {
  gamepadIndex: number
  getMovementVector(): [number, number] {
    return [
      navigator.getGamepads()[this.gamepadIndex].axes[0],
      navigator.getGamepads()[this.gamepadIndex].axes[1],
    ]
  }

  vibrate() {
    throw new Error('Method not implemented yet')
    // navigator.getGamepads()[this.gamepadIndex].hapticActuators[0].pulse()
  }

  constructor(gamepadIndex) {
    this.gamepadIndex = gamepadIndex
  }
}

export class KeyboardInput implements InputDevice {
  static downKeys = {}
  static keyIsDown(key: string) {
    return Object.keys(KeyboardInput.downKeys).includes(key)
  }

  xPos: string
  xNeg: string
  yPos: string
  yNeg: string

  constructor(xPos: string, xNeg: string, yPos: string, yNeg: string) {
    if (!initialized)
      throw new Error(
        'Cannot construct KeyboardInput before init has been called'
      )
    this.xPos = xPos
    this.xNeg = xNeg
    this.yPos = yPos
    this.yNeg = yNeg
  }

  getMovementVector(): [number, number] {
    return [
      (KeyboardInput.keyIsDown(this.xPos) ? 1 : 0) +
        (KeyboardInput.keyIsDown(this.xNeg) ? -1 : 0),
      (KeyboardInput.keyIsDown(this.yPos) ? 1 : 0) +
        (KeyboardInput.keyIsDown(this.yNeg) ? -1 : 0),
    ]
  }
}

export default function init(callback: Function) {
  initialized = true
  window.addEventListener('keydown', (evt) => {
    KeyboardInput.downKeys[evt.key.toLowerCase()] = true
    callback()
  })
  window.addEventListener('keyup', (evt) => {
    delete KeyboardInput.downKeys[evt.key.toLowerCase()]
  })
}
