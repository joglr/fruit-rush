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
  setLastUsed(currentTime: number) {
    this.lastUsed = currentTime
  }
  canUse(currentTime: number) : boolean {
    return currentTime > this.lastUsed + this.repeatRate
  }
  abstract use(player: Player, currentTime: number): any
}
