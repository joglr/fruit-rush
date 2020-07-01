import { Positionable } from './Positionable.js'

export class Tree extends Positionable {

  constructor(position: [number, number]) {
    super(position)
    super.getDOMElement().textContent = '🌿'
  }

}
