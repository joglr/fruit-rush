import { POSITIONABLE_SIZE } from "../config"
import { Vector2 } from "./Math"

export class Box {
  protected p: Vector2

  protected dimensions: Vector2 = Vector2.fromArray([
    POSITIONABLE_SIZE,
    POSITIONABLE_SIZE,
  ])

  constructor(p: number[]) {
    this.p = Vector2.fromArray(p)
  }

  setPosition(position: Vector2): this {
    this.p = position
    return this
  }

  getP(): Vector2 {
    return this.p
  }

  getDimensions(): Vector2 {
    return this.dimensions
  }

  setDimensions(dimensions: Vector2): this {
    this.dimensions = dimensions
    return this
  }
  setDimensionsFromTuple(dimensions: [number, number]): this {
    this.dimensions = Vector2.fromArray(dimensions)
    return this
  }
}
