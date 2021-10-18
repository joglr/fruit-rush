import { Vector2 } from "./Math"
import { Box } from "./Box"
import { FRAMERATE_MIGRATION_DURATION, gravityAmount } from "../config"

export abstract class Displaceable extends Box {
  protected v: Vector2
  protected a: Vector2

  constructor(
    p: [number, number],
    v: [number, number] = [0, 0],
    a: [number, number] = [0, gravityAmount]
  ) {
    super(p)
    this.v = Vector2.fromArray(v)
    this.a = Vector2.fromArray(a)
  }

  abstract draw(ctx: CanvasRenderingContext2D, timeStamp: number): void
  drawWithHitBox(ctx: CanvasRenderingContext2D, timeStamp: number) {
    this.draw(ctx, timeStamp)
    ctx.strokeStyle = this.getColor()
    const halfSize = this.getDimensions().multiply(0.5)
    const orig = this.p.subtract(halfSize)
    ctx.strokeRect(...orig.toArray(), ...this.getDimensions().toArray())
  }

  getColor() {
    return "red"
  }

  getV() {
    return this.v
  }
  getA() {
    return this.a
  }

  getPosition() {
    return this.p.toArray()
  }
  getVelocity() {
    return this.v.toArray()
  }
  getAcceleration() {
    return this.a.toArray()
  }

  update(deltaT: number) {
    this.p = this.p.add(
      this.v.divide(FRAMERATE_MIGRATION_DURATION).multiply(deltaT)
    )
    let newV = this.v.add(
      this.a.divide(FRAMERATE_MIGRATION_DURATION).multiply(deltaT)
    )

    const magV = newV.getMagnitude()
    if (magV > 10) {
      const InvSquareV = (1 / Math.pow(magV, 2)) * 0.1
      const factor = 1 - InvSquareV
      // if (factor < 0) debugger
      newV = newV.multiply(factor)
    }
    this.v = newV
  }

  setVelocity(velocity: Vector2): this {
    this.v = velocity
    return this
  }

  setAcceleration(acceleration: Vector2): this {
    this.a = acceleration
    return this
  }

  intersectsWith(b: Box): boolean {
    const [aw, ah] = this.getDimensions().toArray()
    const [bw, bh] = b.getDimensions().toArray()

    const [minAx, minAy] = this.p.toArray()
    const [minBx, minBy] = b.getP().toArray()
    const [maxAx, maxAy] = [minAx + aw, minAy + ah]
    const [maxBx, maxBy] = [minBx + bw, minBy + bh]

    // // Intersection of two rectangles

    return maxAx >= minBx && minAx <= maxBx && minAy <= maxBy && maxAy >= minBy
  }
}
