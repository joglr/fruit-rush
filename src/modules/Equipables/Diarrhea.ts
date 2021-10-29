import { diarrheaRecoilMultiplier, diarrheaVelocity } from "../../config"
import { Equipable } from "../Equipable"
import { Vector2 } from "../Math"
import { Player } from "../Player"
import { playSFX } from "../sound"
import { Poop } from "./PoopGun"

export class Diarrhea extends Equipable {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  use(p: Player, currentTime: number, _deltaT: number) {
    if (p.isStunned || !this.canUse(currentTime)) return
    this.setLastUsed(currentTime)
    playSFX("diarrhea")

    const v = new Vector2(-1 + Math.random() * 2, 1)

    const wv = v.setMagnitude(diarrheaVelocity + p.getV().getMagnitude())
    const rv = v.setMagnitude(diarrheaVelocity)

    // Recoil
    p.setVelocity(
      p.getV().add(rv.flip().multiply(diarrheaRecoilMultiplier))
      // .divide(FRAMERATE_MIGRATION_DURATION)
      // .multiply(deltaT)
    )

    return new Poop(
      p.getP().add(p.getDimensions().setDirection(v).multiply(1)).toArray(),
      wv.toArray()
    )
  }
}
