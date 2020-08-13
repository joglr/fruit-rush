import { InputDevice } from './InputDevice.js'
import { Positionable } from './Positionable.js'
import { WaterGun } from './Equipables/WaterGun.js'
import { NotAFlameThrower } from './Equipables/NotAFlameThrower.js'

export class Player extends Positionable {

  private static currentHue = 0
  private static genHue(): number {
    const hue = this.currentHue
    Player.currentHue += 45
    return hue
  }

  static initialHealth = 100
  static playerIcon = '🐨'

  static createFilter(hue: number, sepia: number = 150): string {
    return `sepia(${sepia}%) saturate(300%) hue-rotate(${hue}deg) brightness(0.8)`
  }

  private inputDevice: InputDevice
  private hue = Player.genHue()

  private health: number = Player.initialHealth
  private isOnFire: boolean = false
  private primaryActionEquipable = new WaterGun(2000)
  private secondaryActionEquipable = new NotAFlameThrower(2000)

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
  getPrimaryActionEquipable() {
    return this.primaryActionEquipable
  }
  getSecondaryActionEquipable() {
    return this.secondaryActionEquipable
  }
  getHue(): number {
    return this.hue
  }


  setOnFire() {
    this.isOnFire = true
  }

  extinguish() {
    this.isOnFire = false
  }

  getIsOnFire() {
    return this.isOnFire
  }

  getHealth() {
    return this.health
  }

  heal(amount: number) {
    this.health = Math.min(this.health + amount, Player.initialHealth)
  }

  damage(amount: number) {
    this.health = Math.max(this.health - amount, 0)
    // TODO: Handle player ded
  }


}
