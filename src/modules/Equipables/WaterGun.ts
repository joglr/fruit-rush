import { Player } from "../Player.js";
import { Positionable } from "../Positionable.js";
import { Equipable } from "../Equipable.js";
import { Updateable } from "../Updateable.js";

export class WaterGun extends Equipable {

  constructor(repeatRate : number) {
    super(repeatRate)
  }

  use(player: Player, currentTime: number): Updateable {
    this.setLastUsed(currentTime)
    const pv = player.getInputDevice().getMovementVector()
    const wv = pv.multiply(2)
    return new Water(player.getPosition(), wv.getComponents())
  }
}

export class Water extends Positionable implements Updateable {

  private velocity: [number, number] = [0,0]

  constructor(position: [number, number], velocity: [number, number]) {
    super(position)
    this.velocity = velocity
    super.getDOMElement().textContent = '💦'
  }

  update() {
    this.position[0] += this.velocity[0]
    this.position[1] += this.velocity[1]
  }
}
