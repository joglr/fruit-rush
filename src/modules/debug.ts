import { InputDevice } from "./InputDevice"
import { UnitVector2, Vector2 } from "./Math"

export interface GitMetadata {
  hash: string
  subject: string
  time: number
}

let gitMetadata: GitMetadata | null = null

export async function loadGitMetadata() {
  if (process.env.NODE_ENV !== "development") {
    const r = await fetch("metadata.json")
    const json = await r.json()
    gitMetadata = json
  } else {
    gitMetadata = {
      hash: "0000000",
      subject: "N/A",
      time: new Date().getTime(),
    }
  }
}

export const getGitMetadata = () => gitMetadata

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
