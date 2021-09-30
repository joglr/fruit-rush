// enum InputDeviceType {
//   GAMEPAD,
//   KEYBOARD
// }

import { DEAD_ZONE_THRESHOLD } from "../config"
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
let keyboardInputInstance: KeyboardInput | null = null

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
      strongMagnitude: 1,
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
    return (
      navigator.getGamepads()[this.gamepadIndex]?.buttons[7].pressed === true
    )
  }

  getJumpButtonIsDown(): boolean {
    return (
      navigator.getGamepads()[this.gamepadIndex]?.buttons[6].pressed === true
    )
  }

  getSecondaryActionButtonIsDown(): boolean {
    return (
      navigator.getGamepads()[this.gamepadIndex]?.buttons[0].pressed === true
    )
  }
}

// const preventDefaultKeys =

type Key =
  | "escape"
  | "f1"
  | "f2"
  | "f3"
  | "f4"
  | "f5"
  | "f6"
  | "f7"
  | "f8"
  | "f9"
  | "f10"
  | "f11"
  | "f12"
  | "delete"
  | "insert"
  | "½"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "0"
  | "+"
  | "backspace"
  | "enter"
  | "å"
  | "p"
  | "o"
  | "i"
  | "u"
  | "y"
  | "t"
  | "r"
  | "e"
  | "w"
  | "q"
  | "tab"
  | "capslock"
  | "a"
  | "s"
  | "d"
  | "f"
  | "g"
  | "h"
  | "j"
  | "k"
  | "l"
  | "'"
  | "shift"
  | "_"
  | "."
  | ","
  | "m"
  | "n"
  | "b"
  | "v"
  | "c"
  | "x"
  | "z"
  | "<"
  | "control"
  | "meta"
  | "alt"
  | " "
  | "altgraph"
  | "arrowleft"
  | "arrowdown"
  | "arrowup"
  | "arrowright"

export class KeyboardInput implements InputDevice {
  static downKeys = new Map<Key, boolean>()
  static keyIsDown(keys: Key[]): boolean {
    return keys.some((key) => Boolean(KeyboardInput.downKeys.get(key)))
  }

  allKeys: Key[]
  xPosKeys: Key[]
  xNegKeys: Key[]
  yPosKeys: Key[]
  yNegKeys: Key[]
  xPosAimKeys: Key[]
  xNegAimKeys: Key[]
  yPosAimKeys: Key[]
  yNegAimKeys: Key[]
  jumpKey: Key[]
  primaryActionKey: Key[]
  secondaryActionKey: Key[]

  constructor({
    xPos = [],
    xNeg = [],
    yPos = [],
    yNeg = [],
    xPosAim = [],
    xNegAim = [],
    yPosAim = [],
    yNegAim = [],
    jumpKey = [],
    primaryActionKey = [],
    secondaryActionKey = [],
  }: {
    xPos?: Key[]
    xNeg?: Key[]
    yPos?: Key[]
    yNeg?: Key[]
    xPosAim?: Key[]
    xNegAim?: Key[]
    yPosAim?: Key[]
    yNegAim?: Key[]
    jumpKey?: Key[]
    primaryActionKey?: Key[]
    secondaryActionKey?: Key[]
  }) {
    if (!initialized)
      throw new Error(
        "Cannot construct KeyboardInput before init has been called"
      )
    if (keyboardInputInstance)
      throw new Error("Cannot instantiate multiple KeyboardInput instances")
    keyboardInputInstance = this
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
    this.allKeys = [
      ...this.xPosKeys,
      ...this.xNegKeys,
      ...this.yPosKeys,
      ...this.yNegKeys,
      ...this.xPosAimKeys,
      ...this.xNegAimKeys,
      ...this.yPosAimKeys,
      ...this.yNegAimKeys,
      ...this.jumpKey,
      ...this.primaryActionKey,
      ...this.secondaryActionKey,
    ]
  }

  hasKey(key: Key) {
    return this.allKeys.includes(key)
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
        (KeyboardInput.keyIsDown(this.yNegKeys) ? -1 : 0)
    )
  }
  getAimVector(): UnitVector2 {
    return new Vector2(
      (KeyboardInput.keyIsDown(this.xPosAimKeys) ? 1 : 0) +
        (KeyboardInput.keyIsDown(this.xNegAimKeys) ? -1 : 0),
      (KeyboardInput.keyIsDown(this.yPosAimKeys) ? 1 : 0) +
        (KeyboardInput.keyIsDown(this.yNegAimKeys) ? -1 : 0)
    )
  }
}

export default function init(callback?: Function) {
  initialized = true
  window.addEventListener("keydown", (evt) => {
    const key = evt.key.toLowerCase() as Key
    if (keyboardInputInstance?.hasKey(key)) evt.preventDefault()
    KeyboardInput.downKeys.set(key, true)
    if (callback) callback()
  })
  window.addEventListener("keyup", (evt) => {
    const key = evt.key.toLowerCase() as Key
    if (keyboardInputInstance?.hasKey(key)) evt.preventDefault()
    KeyboardInput.downKeys.delete(key)
  })
}

// Use the value 0.5 to make moving with a controller comparable to using arrow keys

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
