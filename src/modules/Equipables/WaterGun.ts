import { Player } from "../Player.js";
import { Positionable } from "../Positionable.js";
import { Equipable } from "../Equipable.js";
import { Updateable } from "../Updateable.js";

export class WaterGun implements Equipable {
  use(player: Player): Updateable {
    return new Water(player.getPosition(), player.getInputDevice().getMovementVector())
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
