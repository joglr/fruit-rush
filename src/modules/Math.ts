export function randBetween(from: number, to: number) {
  return from + Math.floor(Math.random() * (to - from))
}

export enum Axis {
  X,Y
}

export class Vector2  {
  static NullVector = new Vector2(0, 0)

  0: number;
  1: number;

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
    throw new Error
  }

  toArray(): [number, number] {
    return [this[0], this[1]]
  }

  setComponents([x, y]: [number, number]) {
    this[0] = x
    this[1] = y
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
    const [x,y] = this
    const [ox, oy] = v
    return new Vector2(
      x + ox,
      y + oy
    )
  }

  subtract(v: Vector2) {
    const [x,y] = this
    const [ox, oy] = v
    return new Vector2(
      x - ox,
      y - oy
    )
  }

  multiply(factor: number): Vector2 {
    const [x, y] = this
    return new Vector2(x * factor, y * factor)
  }

  divide(factor: number): Vector2 {
    if (factor === 0) throw new Error("Divide by zero")
    return this.multiply(1 / factor)
  }

  setMagnitude(m : number) {
    return this.toUnitVector().multiply(m)
  }

  getMagnitude = () => Math.sqrt(this.getMagnitudeSquared())

  setDirection = (u: Vector2) => u.toUnitVector().multiply(this.getMagnitude())

  normalize = () => this.divide(this.getMagnitude())

  getMagnitudeSquared(): number {
    const [x, y] = this.toArray()
    return x ** 2 + y ** 2;
  }

  static fromArray([x, y]: number[]) {
    return new Vector2(x, y)
  }


  *[Symbol.iterator]() {
    yield* [this[0], this[1]]
  }
}

export class UnitVector2 extends Vector2 {
  static fromArray([x, y]: number[]) {
    return new UnitVector2(x, y).toUnitVector()
  }
}

export function pick(items: any[]) {
  return items[Math.floor(Math.random() * items.length)]
}
