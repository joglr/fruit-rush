import { Player } from '../Player.js'
import { Positionable } from '../Positionable.js'
import { Equipable } from '../Equipable.js'
import { Updateable } from '../Updateable.js'

export class NotAFlameThrower extends Equipable {
  constructor(repeatRate: number) {
    super(repeatRate)
  }

  use(player: Player, currentTime: number): Updateable {
    this.setLastUsed(currentTime)
    const pv = player.getInputDevice().getAimVector()
    const wv = pv.multiply(2.5)
    return new Fire(player.getPosition(), wv.getComponents())
  }
}

export class Fire extends Positionable implements Updateable {
  static fireIcon = '🔥'
  // Fire damage inflicted on the player pr. second
  static fireDamage = 1
  static impactDamage = 0.05

  private velocity: [number, number] = [0, 0]

  constructor(position: [number, number], velocity: [number, number] = [0, 0]) {
    super(position)
    this.velocity = velocity
    super.getDOMElement().textContent = Fire.fireIcon
  }

  update() {
    this.position[0] += this.velocity[0]
    this.position[1] += this.velocity[1]
  }
}
