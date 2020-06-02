// enum InputDeviceType {
//   GAMEPAD,
//   KEYBOARD
// }

export interface InputDevice {
  getMovementVector(): [number, number]
}

let initialized = false

export class GamepadInput implements InputDevice {
  gamepadIndex: number
  getMovementVector(): [number, number] {
    const gp = navigator.getGamepads()[this.gamepadIndex]
    // @ts-ignore
    const x = gp.axes[0]
    // @ts-ignore
    const y = gp.axes[1]
    return [normalizeToDeadZone(x), normalizeToDeadZone(y)]
  }

  vibrate() {
    throw new Error('Method not implemented yet')
    // navigator.getGamepads()[this.gamepadIndex].hapticActuators[0].pulse()
  }

  constructor(gamepadIndex: number) {
    this.gamepadIndex = gamepadIndex
  }
}

export class KeyboardInput implements InputDevice {
  static downKeys = new Map()
  static keyIsDown(keys: string[]): boolean {
    return keys.some((key) => Boolean(KeyboardInput.downKeys.get(key)))
  }

  xPosKeys: string[]
  xNegKeys: string[]
  yPosKeys: string[]
  yNegKeys: string[]

  constructor(xPos: string[], xNeg: string[], yPos: string[], yNeg: string[]) {
    if (!initialized)
      throw new Error(
        'Cannot construct KeyboardInput before init has been called'
      )
    this.xPosKeys = xPos
    this.xNegKeys = xNeg
    this.yPosKeys = yPos
    this.yNegKeys = yNeg
  }

  getMovementVector(): [number, number] {
    return [
      (KeyboardInput.keyIsDown(this.xPosKeys) ? 1 : 0) +
        (KeyboardInput.keyIsDown(this.xNegKeys) ? -1 : 0),
      (KeyboardInput.keyIsDown(this.yPosKeys) ? 1 : 0) +
        (KeyboardInput.keyIsDown(this.yNegKeys) ? -1 : 0),
    ]
  }
}

export default function init(callback?: Function) {
  initialized = true
  window.addEventListener('keydown', (evt) => {
    // evt.preventDefault()
    KeyboardInput.downKeys.set(evt.key.toLowerCase(), true)
    if (callback) callback()
  })
  window.addEventListener('keyup', (evt) => {
    // evt.preventDefault()
    KeyboardInput.downKeys.delete(evt.key.toLowerCase())
  })
}

const DEAD_ZONE_THRESHOLD = 0.5

function normalizeToDeadZone(input: number): number {
  const sign = input < 0 ? -1 : 1
  let magnitude = Math.abs(input)

  if (
    magnitude - DEAD_ZONE_THRESHOLD <
    0
    // && magnitude + DEAD_ZONE_THRESHOLD > -DEAD_ZONE_THRESHOLD
  )
    magnitude = 0
  if (input + DEAD_ZONE_THRESHOLD > 1) magnitude = 1

  return sign * magnitude
}
