import { Player } from "../Player";
import { Positionable } from "../Positionable";
import { Equipable } from "../Equipable";
import { Updateable } from "../Updateable";

export class WaterGun implements Equipable {
  use(player: Player): Updateable {
    return new Water(player.getPosition(), player.getInputDevice().getMovementVector())
  }
}

class Water implements Positionable, Updateable {
  private position: [number, number]
  private velocity: [number, number] = [0,0]
  private DOMElement = document.createElement('div')

  constructor(position: [number, number], velocity: [number, number]) {
    this.position = position
    this.velocity = velocity
    this.DOMElement.textContent = '💦'
    this.DOMElement.classList.add('positionable')
  }

  update() {
    this.position[0] += this.velocity[0]
    this.position[1] += this.velocity[1]
  }

  getPosition(): [number, number] {
    return this.position
  }
  getDOMElement(): HTMLDivElement {
    return this.DOMElement
  }

}
