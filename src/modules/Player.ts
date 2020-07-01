import { InputDevice } from './InputDevice.js'
import { Positionable } from './Positionable.js'
import { WaterGun } from './Equipables/WaterGun.js'

export class Player extends Positionable {
  private static currentHue = 0
  private static genHue(): number {
    const hue = this.currentHue
    Player.currentHue += 45
    return hue
  }
  static playerIcon = '🐨'
  static fireIcon = '🔥'

  static createFilter(hue: number, sepia: number = 150): string {
    return `sepia(${sepia}%) saturate(300%) hue-rotate(${hue}deg) brightness(0.8)`
  }

  private inputDevice: InputDevice
  private hue = Player.genHue()

  private health: number = 100
  private actionEquipable = new WaterGun()

  constructor(inputDevice: InputDevice) {
    super([0,0])
    this.inputDevice = inputDevice
    this.DOMElement.textContent = Player.playerIcon
    this.DOMElement.classList.add('positionable')
    this.DOMElement.style.filter = Player.createFilter(this.hue)
  }
  getInputDevice() {
    return this.inputDevice
  }
  getActionEquipable() {
    return this.actionEquipable
  }
  getHue(): number {
    return this.hue
  }
  getDimensions(): [number, number] {
    return [22, 22]
  }
}
