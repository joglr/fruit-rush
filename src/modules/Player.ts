import { InputDevice } from "./InputDevice"
import { PoopGun } from "./Equipables/PoopGun"
import { Icon } from "./Icon"
import { Axis } from "./Math"
import {
  playerInitialLives,
  playerCoolDownIndicatorOffset,
  playerMaxHorizontalVelocity,
  playerMinHorizontalVelocity,
  playerStunDuration,
  playerTurnStrength,
  poopGunRepeatRate,
} from "../config"
import { playSFX } from "./sound"
import { GameState, gameState, GameStatus } from "./gameState"
import { Equipable } from "./Equipable"

let currentHue = 0

export const resetHue = () => {
  currentHue = 0
}

function genHue(): number {
  const hue = currentHue
  currentHue += 45
  return hue
}

export enum PlayerState {
  DEFAULT = "🐵",
  STUNNED = "🙈",
  EAT = "🙊",
  DEAD = "💀",
  DIARRHEA = "🐒",
}

// const getMonkey = () => pick(["🙈", "🙉", "🙊", "🐵","🐒","🦍"])
export class Player extends Icon {
  private score = 0
  private _state = PlayerState.DEFAULT

  public get icon() {
    return this._state
  }

  public set state(value) {
    this._state = value
  }

  public get state() {
    return this._state
  }

  playerNumber: number

  public get isStunned() {
    return this._state === PlayerState.STUNNED
  }

  public get hasDiarrhea() {
    return this._state === PlayerState.DIARRHEA
  }
  stunTimeout: number | null = null
  resetIconTimeout: number | null = null

  public get dead() {
    return this._state === PlayerState.DEAD
  }

  public kill() {
    this.justDied = true
    this._state = PlayerState.DEAD
  }

  justDied = false
  isReady = false

  static createFilter(hue: number, sepia = 150): string {
    return `filter: sepia(${sepia}%) saturate(300%) hue-rotate(${hue}deg) brightness(0.8)`
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
      const [x, y] = this.getP()
        .subtract(this.getDimensions().divide(2))
        .toArray()
      const [w, h] = this.dimensions
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
      const [, h] = this.dimensions
      ctx.font = `${h / 2}px sans-serif`
      ctx.fillStyle = this.getColor()
      ctx.fillText(
        this.getPlayerString(gameState.getState()),
        x,
        y - this.getDimensions()[1]
      )
    }
    // ctx.fillText((this.playerNumber + 1).toString(), x, y - this.getDimensions()[1] - playerIndicatorOffset)
  }

  getPlayerStatusString(suffix = "") {
    return `P${this.playerNumber + 1}${suffix}`
  }

  getPlayerString(gameState: GameState) {
    switch (gameState.status) {
      case GameStatus.RUNNING:
        if (this.dead) {
          return this.getPlayerStatusString(": dead")
        }

        return `${this.getScore().toString()}🍌 ${this.getLives()}💗`
      case GameStatus.IDLE:
        // Display whether the player is ready or not
        return this.getPlayerStatusString(
          ` ready: ${this.isReady ? "✔" : "❌"}`
        )

      default:
        return ""
    }
  }

  getPlayerScoreboardString(gameState: GameState) {
    return this.getPlayerString(gameState)
  }

  private inputDevice: InputDevice
  private hue = genHue()

  private lives: number = playerInitialLives
  private primaryActionEquipable: Equipable = new PoopGun(poopGunRepeatRate)

  setPrimaryActionEquipable(e: Equipable) {
    this.primaryActionEquipable = e
  }

  constructor(
    playerNumber: number,
    inputDevice: InputDevice,
    position: [number, number]
  ) {
    super(position)
    this.playerNumber = playerNumber
    this.inputDevice = inputDevice
  }

  reset(position: [number, number]) {
    return new Player(this.playerNumber, this.inputDevice, position)
  }

  eat(value: number) {
    playSFX("eat")
    this.state = PlayerState.EAT
    this.resetIconTimeout = window.setTimeout(() => {
      this.state = PlayerState.DEFAULT
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
  getHue(): number {
    return this.hue
  }

  stun() {
    playSFX("hit")
    this.damage(1, () => {
      this.state = PlayerState.STUNNED

      this.stunTimeout = window.setTimeout(() => {
        this.state = PlayerState.DEFAULT
      }, playerStunDuration)
    })
  }

  getLives() {
    return this.lives
  }

  heal(amount: number) {
    this.lives = Math.min(this.lives + amount, playerInitialLives)
  }

  damage(amount: number, callback: () => void) {
    this.getInputDevice().hapticFeedback()
    const newLives = Math.max(this.lives - amount, 0)
    if (newLives <= 0) {
      if (this.stunTimeout) window.clearTimeout(this.stunTimeout)
      if (this.resetIconTimeout) window.clearTimeout(this.resetIconTimeout)
      this.kill()
      this.lives = 0
    } else {
      this.lives = newLives
      callback()
    }
  }

  update(deltaT: number) {
    if (this.isStunned) return
    const limitMultiplier = this.state === PlayerState.DIARRHEA ? 0.2 : 1
    const velocityChange = this.getInputDevice()
      .getMovementVector()
      .multiply(playerTurnStrength)
      .constrainToAxis(Axis.X)

    if (!this.dead) this.v = this.v.add(velocityChange)
    super.update(deltaT)

    this.v = this.v.limitAxis(
      playerMinHorizontalVelocity * limitMultiplier,
      playerMaxHorizontalVelocity * limitMultiplier,
      Axis.X
    )
  }
}
