import { InputDevice } from './InputDevice.js'
import { Positionable } from './Positionable.js'

export class Player implements Positionable {
  private static currentHue = 0
  private static genHue(): number {
    const hue = this.currentHue
    Player.currentHue += 45
    return hue
  }
  static playerIcon = '🐨'

  static createFilter(hue: number, sepia: number = 150): string {
    return `sepia(${sepia}%) saturate(300%) hue-rotate(${hue}deg) brightness(0.8)`
  }

  private inputDevice: InputDevice
  private position: [number, number]
  private hue: number
  private DOMElement: HTMLDivElement

  constructor(inputDevice: InputDevice) {
    this.inputDevice = inputDevice
    this.position = [0, 0]
    this.hue = Player.genHue()
    this.DOMElement = document.createElement('div')
    this.DOMElement.textContent = Player.playerIcon
    this.DOMElement.classList.add('positionable')
    this.DOMElement.style.filter = Player.createFilter(this.hue)
  }
  getInputDevice() {
    return this.inputDevice
  }
  getPosition(): [number, number] {
    return this.position
  }
  getHue(): number {
    return this.hue
  }
  getDOMElement(): HTMLDivElement {
    return this.DOMElement
  }
  setPosition(position: [number, number]) {
    this.position = position
  }
}
