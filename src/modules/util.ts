export function randBetween(from: number, to: number) {
  return from + Math.floor(Math.random() * (to - from))
}

export class Vector2 {
  private components: [number, number]

  constructor(x: number, y: number) {
    this.components = [x, y]
  }

  toUnitVector(): Vector2 {
    const size = this.size()
    let [x, y] = this.getComponents().map(c => c / size)
    return new Vector2(x, y)
  }
  toPositiveVector(): Vector2 {
    return Vector2.fromArray(this.getComponents().map(Math.abs))
  }

  getComponents(): [number, number] {
    return this.components
  }

  multiply(factor: number): Vector2 {
    const [x, y] = this.components
    return new Vector2(x * factor, y * factor)
  }

  size(): number {
    return Math.sqrt(this.sizeSquared())
  }
  sizeSquared(): number {
    let sizeSquared = 0
    for (let c of this.getComponents()) {
      sizeSquared += c ** 2
    }
    return sizeSquared
  }

  static fromArray([x, y]: number[]) {
    return new Vector2(x, y)
  }

}