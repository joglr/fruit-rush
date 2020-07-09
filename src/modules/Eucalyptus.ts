import { Positionable } from './Positionable.js'
import { Player } from './Player.js'

export class Eucalyptus extends Positionable {

  static healAmount = Player.initialHealth
//   static healAmount = 5

  constructor(position: [number, number]) {
    super(position)
    super.getDOMElement().textContent = '🌿'
  }

}
