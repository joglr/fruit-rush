export function randBetween(from: number, to: number) {
  return from + Math.floor(Math.random() * (to - from))
}

export function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

type AxisIndex = 0 | 1

export enum Axis {
  X,
  Y,
}

const axisToIndex = (a: Axis): AxisIndex => Number(a) as AxisIndex

export class Vector2 {
  static NullVector = new Vector2(0, 0)

  0: number
  1: number

  constructor(x: number, y: number) {
    this[0] = x
    this[1] = y
  }

  toUnitVector(): UnitVector2 {
    const size = this.getMagnitude()
    return this.divide(size)
  }

  toPositiveVector(): Vector2 {
    return Vector2.fromArray(this.toArray().map(Math.abs))
  }

  constrainToAxis(a: Axis): Vector2 {
    if (a === Axis.X) return new Vector2(this[0], 0)
    if (a === Axis.Y) return new Vector2(0, this[1])
    throw new Error()
  }

  toArray(): [number, number] {
    return [this[0], this[1]]
  }

  setComponents([x, y]: [number, number]): this {
    this[0] = x
    this[1] = y
    return this
  }

  isNullVector() {
    return this.is(Vector2.NullVector)
  }

  is(v: Vector2) {
    const [x1, y1] = this
    const [x2, y2] = v

    return x1 === x2 && y1 === y2
  }

  add(v: Vector2) {
    const [x, y] = this
    const [ox, oy] = v
    return new Vector2(x + ox, y + oy)
  }

  subtract(v: Vector2) {
    const [x, y] = this
    const [ox, oy] = v
    return new Vector2(x - ox, y - oy)
  }

  multiply(factor: number): Vector2 {
    const [x, y] = this
    return new Vector2(x * factor, y * factor)
  }

  divide(factor: number): Vector2 {
    if (factor === 0) throw new Error("Divide by zero")
    return this.multiply(1 / factor)
  }

  setMagnitude(m: number) {
    return this.toUnitVector().multiply(m)
  }

  getMagnitude = () => Math.sqrt(this.getMagnitudeSquared())

  setDirection = (u: Vector2) => u.toUnitVector().multiply(this.getMagnitude())

  normalize = () => this.divide(this.getMagnitude())

  limit(min: number, max: number) {
    if (this.getMagnitude() > max) return this.setMagnitude(max)
    if (this.getMagnitude() < min) return this.setMagnitude(min)
    return this
  }

  copy() {
    return Vector2.fromArray(this.toArray())
  }

  setAxis(value: number, axis: Axis) {
    const tempVect = this.copy()
    const axisIndex = axisToIndex(axis)
    tempVect[axisIndex] = value
    return tempVect
  }

  flip() {
    return new Vector2(-this[0], -this[1])
  }

  limitAxis(min: number, max: number, axis: Axis) {
    const axisIndex = axisToIndex(axis)
    return this.setAxis(limit(min, max, this[axisIndex]), axis)
  }

  getMagnitudeSquared(): number {
    const [x, y] = this.toArray()
    return x ** 2 + y ** 2
  }

  static fromArray([x, y]: number[]) {
    return new Vector2(x, y)
  }

  *[Symbol.iterator]() {
    yield* [this[0], this[1]]
  }
}

export function limit(min: number, max: number, value: number) {
  if (min > max) throw new Error("Min is larger than max")
  return Math.min(Math.max(min, value), max)
}

export class UnitVector2 extends Vector2 {
  static fromArray([x, y]: number[]) {
    return new UnitVector2(x, y).toUnitVector()
  }
}

export function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}
