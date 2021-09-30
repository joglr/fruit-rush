import { InputDevice } from "./InputDevice"
import { PoopGun } from "./Equipables/PoopGun"
import { NotAFlameThrower } from "./Equipables/NotAFlameThrower"
import { Icon } from "./Icon"
import { Axis } from "./Math"
import {
  playerInitialHealth,
  playerCoolDownIndicatorOffset,
  playerMaxHorizontalVelocity,
  playerMinHorizontalVelocity,
  playerStunDuration,
  playerTurnStrength,
  poopGunCoolDown,
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
  DEAD = "💀"
}

// const getMonkey = () => pick(["🙈", "🙉", "🙊", "🐵","🐒","🦍"])
export class Player extends Icon {
  private score = 0
  icon = PlayerState.DEFAULT

  playerNumber: number
  isStunned = false
  hasDiarrhea = false
  stunTimeout = -1
  resetIconTimeout = -1
  dead = false
  justDied = false

  static createFilter(hue: number, sepia: number = 150): string {
    return `sepia(${sepia}%) saturate(300%) hue-rotate(${hue}deg) brightness(0.8)`
  }

  draw(ctx: CanvasRenderingContext2D, timeStamp: number) {
    super.draw(ctx, timeStamp)
    const progress = this.getPrimaryActionEquipable().getProgress(timeStamp)

    if (progress < 1 && progress > 0) {
      // ctx.beginPath()
      // ctx.fillStyle = `hsla(${this.getHue()}, 50%, 50%, 0.5)`

      // const center = this.getP().subtract(this.getDimensions().divide(1.5)).toArray()
      // const rotation = -Math.PI / 2
      // const start = -2 * Math.PI * (1 - progress)
      // const radius = this.getDimensions().getMagnitude() / 4
      // ctx.arc(...center, radius, rotation + start, rotation)
      // ctx.lineTo(...center)
      // ctx.fill()
      const [x,y] = this.getP().subtract(this.getDimensions().divide(2)).toArray()
      const [w,h] = this.dimensions
      ctx.fillStyle = "#fff"
      ctx.fillRect(
        x,
        y - playerCoolDownIndicatorOffset * h,
        (1 - progress) * w,
        h / 10
      )
    }

    // Draw score above player

    const [x, y] = this.getPosition()
    if (!this.dead) {
      const [,h] = this.dimensions
      ctx.font = `bold ${h / 2}px sans-serif`
      ctx.fillStyle = this.getColor()
      ctx.fillText(
        `${this.getScore().toString()}🍌 ${this.getHealth()}❤`,
        x,
        y - this.getDimensions()[1]
      )
    }
    // ctx.fillText((this.playerNumber + 1).toString(), x, y - this.getDimensions()[1] - playerIndicatorOffset)
  }

  private inputDevice: InputDevice
  private hue = genHue()

  private health: number = playerInitialHealth
  private isOnFire: boolean = false
  private primaryActionEquipable = new PoopGun(poopGunCoolDown)
  private secondaryActionEquipable = new NotAFlameThrower(2000)

  constructor(playerNumber: number, inputDevice: InputDevice, position: [number, number]) {
    super(position)
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
    if (this.dead) return
    this.isStunned = true
    this.icon = PlayerState.STUNNED

    this.stunTimeout = setTimeout(() => {
      this.isStunned = false
      this.icon = PlayerState.DEFAULT
    }, playerStunDuration)
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
    this.health = Math.min(this.health + amount, playerInitialHealth)
  }

  damage(amount: number) {
    const newHealth = Math.max(this.health - amount, 0)
    if (newHealth <= 0) {
      clearTimeout(this.stunTimeout)
      clearTimeout(this.resetIconTimeout)
      this.dead = true
      this.justDied = true
      this.health = 0
      this.icon = PlayerState.DEAD
    } else this.health = newHealth
  }

  update() {
    if (this.isStunned) return
    const velocityChange = this.getInputDevice()
      .getMovementVector()
      .multiply(playerTurnStrength)
      .constrainToAxis(Axis.X)

    if (!this.dead) this.v = this.v.add(velocityChange)
    super.update()

    this.v = this.v.limitAxis(
      playerMinHorizontalVelocity,
      playerMaxHorizontalVelocity,
      Axis.X
    )
  }
}
