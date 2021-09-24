import { Player } from "../Player";
import { Equipable } from "../Equipable";
import { Icon } from "../Icon";
import { Displaceable } from "../Displaceable";
import { gravityAmount, poopRecoilMultiplier, poopVelocity } from "../config";
import { playSFX } from "../..";

export class PoopGun extends Equipable {

  constructor(repeatRate : number) {
    super(repeatRate)
  }

  use(p: Player, currentTime: number): Displaceable | undefined {
    if (p.isStunned || !this.canUse(currentTime) || p.getScore() == 0) return;
    p.addToScore(-1);
    this.setLastUsed(currentTime)
    playSFX("shoot")
    p.getInputDevice().hapticFeedback();
    const pv = p.getInputDevice().getAimVector()
    const wv = pv.setMagnitude(poopVelocity + p.getV().getMagnitude())

    // Recoil
    p.setVelocity(p.getV().add(pv.flip().multiply(poopVelocity * poopRecoilMultiplier)))

    return new Poop([0, gravityAmount], wv.toArray(), p.getP().add(p.getDimensions().setDirection(pv).multiply(1)).toArray())
  }
}

export class Poop extends Icon {
  icon = '💩'
}
