// enum InputDeviceType {
//   GAMEPAD,
//   KEYBOARD
// }

import { UnitVector2, Vector2 } from "./Math"

export interface InputDevice {
  getMovementVector(): UnitVector2
  getAimVector(): UnitVector2
  hapticFeedback(): void
  getJumpButtonIsDown(): boolean
  getPrimaryActionButtonIsDown(): boolean
  getSecondaryActionButtonIsDown(): boolean
}

let initialized = false

export class GamepadInput implements InputDevice {
  gamepadIndex: number
  getMovementVector(): UnitVector2 {
    const gp = navigator.getGamepads()[this.gamepadIndex]
    // @ts-ignore
    const x = gp.axes[0]
    // @ts-ignore
    const y = gp.axes[1]
    return new UnitVector2(normalizeToDeadZone(x), normalizeToDeadZone(y))
  }

  getGamepadIndex() {
    return this.gamepadIndex
  }

  constructor(gamepadIndex: number) {
    this.gamepadIndex = gamepadIndex
  }
  hapticFeedback(): void {
    const gamepads = navigator?.getGamepads()
    // @ts-ignore
    gamepads[this.gamepadIndex]?.vibrationActuator.playEffect("dual-rumble", {
      startDelay: 0,
      duration: 100,
      weakMagnitude: 1,
      strongMagnitude: 1
    })

  }
  getAimVector(): UnitVector2 {
    const gp = navigator.getGamepads()[this.gamepadIndex]
    // @ts-ignore
    const x = gp.axes[2]
    // @ts-ignore
    const y = gp.axes[3]
    return new UnitVector2(normalizeToDeadZone(x), normalizeToDeadZone(y))
  }
  getPrimaryActionButtonIsDown(): boolean {
    return navigator.getGamepads()[this.gamepadIndex]?.buttons[7].pressed === true
  }

  getJumpButtonIsDown(): boolean {
    return navigator.getGamepads()[this.gamepadIndex]?.buttons[6].pressed === true
  }

  getSecondaryActionButtonIsDown(): boolean {
    return navigator.getGamepads()[this.gamepadIndex]?.buttons[0].pressed === true
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
  xPosAimKeys: string[]
  xNegAimKeys: string[]
  yPosAimKeys: string[]
  yNegAimKeys: string[]
  jumpKey: string[]
  primaryActionKey: string[]
  secondaryActionKey: string[]

  constructor(
    xPos: string[], xNeg: string[], yPos: string[], yNeg: string[],
    xPosAim: string[], xNegAim: string[], yPosAim: string[], yNegAim: string[],
    jumpKey: string[],
    primaryActionKey: string[],
    secondaryActionKey: string[],
    ) {
    if (!initialized)
      throw new Error(
        'Cannot construct KeyboardInput before init has been called'
      )
    this.xPosKeys = xPos
    this.xNegKeys = xNeg
    this.yPosKeys = yPos
    this.yNegKeys = yNeg
    this.xPosAimKeys = xPosAim
    this.xNegAimKeys = xNegAim
    this.yPosAimKeys = yPosAim
    this.yNegAimKeys = yNegAim
    this.jumpKey = jumpKey
    this.primaryActionKey = primaryActionKey
    this.secondaryActionKey = secondaryActionKey
  }

  hapticFeedback(): void {
    // No haptic feedback for keyboard users...
  }
  getJumpButtonIsDown(): boolean {
    return KeyboardInput.keyIsDown(this.jumpKey)
  }

  getPrimaryActionButtonIsDown(): boolean {
    return KeyboardInput.keyIsDown(this.primaryActionKey)
  }
  getSecondaryActionButtonIsDown(): boolean {
    return KeyboardInput.keyIsDown(this.secondaryActionKey)
  }

  getMovementVector(): Vector2 {
    return new Vector2(
      (KeyboardInput.keyIsDown(this.xPosKeys) ? 1 : 0) +
        (KeyboardInput.keyIsDown(this.xNegKeys) ? -1 : 0),
      (KeyboardInput.keyIsDown(this.yPosKeys) ? 1 : 0) +
        (KeyboardInput.keyIsDown(this.yNegKeys) ? -1 : 0),
    )
  }
  getAimVector(): Vector2 {
    return new Vector2(
      (KeyboardInput.keyIsDown(this.xPosAimKeys) ? 1 : 0) +
        (KeyboardInput.keyIsDown(this.xNegAimKeys) ? -1 : 0),
      (KeyboardInput.keyIsDown(this.yPosAimKeys) ? 1 : 0) +
        (KeyboardInput.keyIsDown(this.yNegAimKeys) ? -1 : 0),
    )
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

// Use the value 0.5 to make moving with a controller comparable to using arrow keys
const DEAD_ZONE_THRESHOLD = 0.1

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
