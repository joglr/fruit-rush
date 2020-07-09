import { Positionable } from './Positionable.js'

export class Fire extends Positionable {

  
  static fireIcon = '🔥'
  // Fire damage inflicted on the player pr. second
  static fireDamage = 1
  static impactDamage = 0.05
  
  constructor(position: [number, number]) {
    super(position)
    super.getDOMElement().textContent = Fire.fireIcon
  }
}
