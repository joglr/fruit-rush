import { limit } from "./Math";
import { Player } from "./Player";

export abstract class Equipable {

  private lastUsed = -Infinity
  private repeatRate : number

  constructor(repeatRate: number) {
    this.repeatRate = repeatRate
  }
  getRepeatRate() : number {
    return this.repeatRate
  }
  getProgress(currentTime: number) {
    return limit(0, 1, (currentTime - this.lastUsed) /this.repeatRate)
  }
  setLastUsed(currentTime: number) {
    this.lastUsed = currentTime
  }
  canUse(currentTime: number) : boolean {
    return currentTime > this.lastUsed + this.repeatRate
  }
  abstract use(player: Player, currentTime: number): any
}
