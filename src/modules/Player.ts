import { InputDevice } from "./InputDevice"
import { PoopGun } from "./Equipables/PoopGun"
import { NotAFlameThrower } from "./Equipables/NotAFlameThrower"
import { Icon } from "./Icon"
import { Axis } from "./Math"
import {
  gravityAmount,
  playerIndicatorOffset,
  playerMaxHorizontalVelocity,
  playerMinHorizontalVelocity,
  playerTurnStrength,
} from "../config"
import { playSFX } from "./sound"

let currentHue = 0

function genHue(): number {
  const hue = currentHue
  currentHue += 45
  return hue
}

enum PlayerState {
  DEFAULT = "🐵",
  STUNNED = "🙈",
  EAT = "🙊",
}

// const getMonkey = () => pick(["🙈", "🙉", "🙊", "🐵","🐒","🦍"])
export class Player extends Icon {
  private score = 0
  icon = PlayerState.DEFAULT

  static initialHealth = 10
  playerNumber: number
  isStunned = false
  hasDiarrhea = false
  stunTimeout = -1
  resetIconTimeout = -1
  dead = false

  static createFilter(hue: number, sepia: number = 150): string {
    return `sepia(${sepia}%) saturate(300%) hue-rotate(${hue}deg) brightness(0.8)`
  }

  draw(ctx: CanvasRenderingContext2D, timeStamp: number) {
    super.draw(ctx, timeStamp)
    const progress = this.getPrimaryActionEquipable().getProgress(timeStamp)

    if (progress < 1 && progress > 0) {
      ctx.beginPath()
      // ctx.fillStyle = "#fff"
      ctx.fillStyle = `hsla(${this.getHue()}, 50%, 50%, 0.5)`

      const center = this.getP().subtract(this.getDimensions().divide(1.5)).toArray()
      const rotation = -Math.PI / 2
      const start = -2 * Math.PI * (1 - progress)
      const radius = this.getDimensions().getMagnitude() / 4
      ctx.arc(...center, radius, rotation + start, rotation)
      ctx.lineTo(...center)
      ctx.fill()
      // ctx.fillRect(
      //   ...this.getP().subtract(this.getDimensions().divide(2)).toArray(),
      //   (1 - progress) * w,
      //   h / 10
      // )
    }
    const [x, y] = this.getPosition()
    if (this.getScore() > 0) {
      const [,h] = this.dimensions
      ctx.font = `bold ${h / 2}px sans-serif`
      ctx.fillStyle = this.getColor()
      ctx.fillText(
        this.getScore().toString(),
        x,
        y - this.getDimensions()[1] - playerIndicatorOffset
      )
    }
    // ctx.fillText((this.playerNumber + 1).toString(), x, y - this.getDimensions()[1] - playerIndicatorOffset)
  }

  private inputDevice: InputDevice
  private hue = genHue()

  private health: number = Player.initialHealth
  private isOnFire: boolean = false
  private primaryActionEquipable = new PoopGun(2000)
  private secondaryActionEquipable = new NotAFlameThrower(2000)

  constructor(playerNumber: number, inputDevice: InputDevice) {
    super([0, gravityAmount])
    this.playerNumber = playerNumber
    this.inputDevice = inputDevice
  }

  eat(value: number) {
    playSFX("eat")
    this.icon = PlayerState.EAT
    this.resetIconTimeout = setTimeout(() => {
      this.icon = PlayerState.DEFAULT
    }, 500)
    this.addToScore(value)
  }

  addToScore(amount: number) {
    this.score += amount
  }

  resetScore() {
    this.score = 0
  }
  getScore() {
    return this.score
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

  stun() {
    playSFX("hit")
    this.damage(1)
    this.isStunned = true
    clearTimeout(this.resetIconTimeout)
    this.icon = PlayerState.STUNNED
    this.stunTimeout = setTimeout(() => {
      this.isStunned = false
      this.icon = PlayerState.DEFAULT
    }, 2000)
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
    const newHealth = Math.max(this.health - amount, 0)
    if (newHealth <= 0) {
      this.dead = true
      this.health = 0
    } else this.health = newHealth
    // TODO: Handle player death
  }

  update() {
    if (this.isStunned) return
    const velocityChange = this.getInputDevice()
      .getMovementVector()
      .multiply(playerTurnStrength)
      .constrainToAxis(Axis.X)

    this.v = this.v.add(velocityChange)
    super.update()
    this.v = this.v.limitAxis(
      playerMinHorizontalVelocity,
      playerMaxHorizontalVelocity,
      Axis.X
    )
  }
}
