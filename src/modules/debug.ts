import { InputDevice } from "./InputDevice"
import { UnitVector2, Vector2 } from "./Math"

export class MockInput implements InputDevice {
  constructor() {
    if (process.env.NODE_ENV !== "development")
      throw new Error(
        "MockInput should not be used in produciton. Development purposes only"
      )
  }

  getMovementVector(): UnitVector2 {
    return Vector2.NullVector
  }
  getAimVector(): UnitVector2 {
    return Vector2.NullVector
  }
  hapticFeedback(): void {
    console
  }
  getJumpButtonIsDown(): boolean {
    return false
  }
  getPrimaryActionButtonIsDown(): boolean {
    return false
  }
  getSecondaryActionButtonIsDown(): boolean {
    return false
  }
}

export const DEBUG = window.location.hash.includes("debug")
