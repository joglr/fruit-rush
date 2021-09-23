import { InputDevice } from "./InputDevice"
import { Displaceable } from "./Displaceable"
import { WaterGun } from "./Equipables/WaterGun"
import { NotAFlameThrower } from "./Equipables/NotAFlameThrower"
import { Icon } from "./Icon"
import { Axis, pick } from "./Math"

let currentHue = 0

function genHue(): number {
  const hue = currentHue
  currentHue += 45
  return hue
}

const getMonkey = () => pick(["🙈", "🙉", "🙊", "🐵"])
export class Player extends Icon {
  icon = getMonkey()

  static initialHealth = 100

  static createFilter(hue: number, sepia: number = 150): string {
    return `sepia(${sepia}%) saturate(300%) hue-rotate(${hue}deg) brightness(0.8)`
  }

  private inputDevice: InputDevice
  private hue = genHue()

  private health: number = Player.initialHealth
  private isOnFire: boolean = false
  private primaryActionEquipable = new WaterGun(2000)
  private secondaryActionEquipable = new NotAFlameThrower(2000)

  constructor(inputDevice: InputDevice) {
    super([0, 0.05])
    setInterval(() => {
      this.icon = getMonkey()
    }, 1000)
    this.inputDevice = inputDevice
  }

  getColor() {
    return `hsl(${this.hue} 50% 50%)`
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

  update() {
    const velocityChange =
      this
        .getInputDevice()
        .getMovementVector()
        .divide(10)
        .constrainToAxis(Axis.X)
    this.v = this.v.add(velocityChange)
    super.update()
  }
}
