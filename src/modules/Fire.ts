import { Positionable } from './Positionable'

export class Fire implements Positionable {
  private position: [number, number]
  private DOMElement: HTMLDivElement

  constructor(position: [number, number]) {
    this.position = position
    this.DOMElement = document.createElement('div')
    this.DOMElement.textContent = '🔥'
    this.DOMElement.classList.add('positionable')
  }

  getPosition(): [number, number] {
    return this.position
  }
  getDOMElement(): HTMLDivElement {
    return this.DOMElement
  }
}
