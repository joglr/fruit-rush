import { Player } from "../Player";
import { Equipable } from "../Equipable";
import { Icon } from "../Icon";
import { Displaceable } from "../Displaceable";

export class WaterGun extends Equipable {

  constructor(repeatRate : number) {
    super(repeatRate)
  }

  use(player: Player, currentTime: number): Displaceable {
    this.setLastUsed(currentTime)
    const pv = player.getInputDevice().getAimVector()
    const wv = pv.multiply(2.5)
    return new Water(player.getP().toArray(), wv.toArray())
  }
}

export class Water extends Icon {
  icon = '💦'
}
