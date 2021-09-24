import { Player } from '../Player'
import { Equipable } from '../Equipable'
import { Icon } from '../Icon'

export class NotAFlameThrower extends Equipable {
  constructor(repeatRate: number) {
    super(repeatRate)
  }

  use(player: Player, currentTime: number) {
    this.setLastUsed(currentTime)
    const pv = player.getInputDevice().getAimVector()
    const wv = pv.multiply(2.5)
    return new Fire(player.getP().toArray(), wv.toArray())
  }
}

export class Fire extends Icon   {
  icon = '🔥'
  // Fire damage inflicted on the player pr. second
  static fireDamage = 1
  static impactDamage = 0.05
}
