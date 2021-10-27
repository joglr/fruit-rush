import { Player } from "../Player"
import { Equipable } from "../Equipable"
import { Icon } from "../Icon"
import { Displaceable } from "../Displaceable"
import {
  FRAMERATE_MIGRATION_DURATION,
  poopRecoilMultiplier,
  poopVelocity,
} from "../../config"
import { playSFX } from "../sound"

export class PoopGun extends Equipable {
  constructor(repeatRate: number) {
    super(repeatRate)
  }

  use(
    p: Player,
    currentTime: number,
    deltaT: number
  ): Displaceable | undefined {
    if (p.isStunned || !this.canUse(currentTime) || p.getScore() == 0) return
    p.addToScore(-1)
    this.setLastUsed(currentTime)
    playSFX("shoot")
    p.getInputDevice().hapticFeedback()
    let v = p.getInputDevice().getAimVector()
    if (v.isNullVector()) v = p.getV()
    if (v.isNullVector()) return // TODO: Save last velocity / move direction

    const wv = v.setMagnitude(poopVelocity + p.getV().getMagnitude())
    const rv = v.setMagnitude(poopVelocity)

    // Recoil
    p.setVelocity(
      p
        .getV()
        .add(
          rv
            .flip()
            .multiply(poopRecoilMultiplier)
            .divide(FRAMERATE_MIGRATION_DURATION)
            .multiply(deltaT)
        )
    )

    return new Poop(
      p.getP().add(p.getDimensions().setDirection(v).multiply(1)).toArray(),
      wv.toArray()
    )
  }
}

export class Poop extends Icon {
  icon = "💩"
}
