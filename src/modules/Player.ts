import { InputDevice } from './InputDevice.js'

export class Player {
  private static currentHue = 0
  private static genHue(): number {
    const hue = this.currentHue
    Player.currentHue += 45
    return hue
  }
  static playerIcon = '🐨'

  static createFilter(hue: number): string {
    return `sepia(100%) saturate(200%) hue-rotate(${hue}deg) brightness(0.7)`
  }

  private inputDevice: InputDevice
  private position: [number, number]
  private hue: number
  private DOMElement: HTMLElement

  constructor(inputDevice: InputDevice) {
    this.inputDevice = inputDevice
    this.position = [0, 0]
    this.hue = Player.genHue()
    this.DOMElement = createPlayerElement(this.hue)
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
  getDOMElement(): HTMLElement {
    return this.DOMElement
  }
  setPosition(position: [number, number]) {
    this.position = position
  }
}

function createPlayerElement(hue: number) {
  const playerElement = document.createElement('div')
  playerElement.textContent = Player.playerIcon
  playerElement.classList.add('player')
  playerElement.style.filter = Player.createFilter(hue)
  return playerElement
}
