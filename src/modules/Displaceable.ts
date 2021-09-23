import { POSITIONABLE_SIZE } from "./settings"
import { Vector2 } from "./Math"

export abstract class Displaceable {
  protected p: Vector2
  protected v: Vector2
  protected a: Vector2

  abstract draw(ctx: CanvasRenderingContext2D): void
  drawWithHitbox(ctx: CanvasRenderingContext2D) {
    this.draw(ctx)
    ctx.strokeStyle = this.getColor()
    const halfSize = this.getDimensions().multiply(0.5)
    const orig = this.p.subtract(halfSize)
    ctx.strokeRect(...orig.toArray(), ...this.getDimensions().toArray())
  }

  getColor() {
    return "red"
  }

  getP() {
    return this.p
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

  update() {
    this.p = this.p.add(this.v)
    let newV = this.v.add(this.a)

    const magV = newV.getMagnitude()
    if (magV > 10) {
      const InvSquareV = (1 / Math.pow(magV, 2)) * 0.1;
      const factor = 1 - InvSquareV
      // if (factor < 0) debugger
      newV = newV.multiply(factor)
    }
    this.v = newV
  }

  protected dimensions: Vector2 = Vector2.fromArray([
    POSITIONABLE_SIZE,
    POSITIONABLE_SIZE,
  ])

  constructor(
    a: [number, number],
    v: [number, number] = [0, 0],
    p: [number, number] = [0, 0]
  ) {
    this.p = Vector2.fromArray(p)
    this.v = Vector2.fromArray(v)
    this.a = Vector2.fromArray(a)
  }

  setPosition(position: Vector2) {
    this.p = position
  }

  setVelocity(velocity: Vector2) {
    this.v = velocity
  }

  setAcceleration(acceleration: Vector2) {
    this.a = acceleration
  }

  getDimensions(): Vector2 {
    return this.dimensions
  }

  setDimensions(dimensions: Vector2): void {
    this.dimensions = dimensions
  }
  setDimensionsFromTuple(dimensions: [number, number]): void {
    this.dimensions = Vector2.fromArray(dimensions)
  }

  intersectsWith(p: Displaceable): boolean {
    const [aw, ah] = this.getDimensions().toArray()
    const [bw, bh] = p.getDimensions().toArray()

    let [minAx, minAy] = this.p.toArray()
    let [minBx, minBy] = p.getP().toArray()
    let [maxAx, maxAy] = [minAx + aw, minAy + ah]
    let [maxBx, maxBy] = [minBx + bw, minBy + bh]

    // // Intersection of two rectangles

    return maxAx >= minBx && minAx <= maxBx && minAy <= maxBy && maxAy >= minBy
  }
}
