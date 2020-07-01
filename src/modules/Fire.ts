import { Positionable } from './Positionable.js'

export class Fire extends Positionable {
  
  constructor(position: [number, number]) {
    super(position)
    super.getDOMElement().textContent = '🔥'
  }
}
