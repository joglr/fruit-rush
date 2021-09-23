import { Displaceable } from "./Displaceable";

export abstract class Icon extends Displaceable {
  abstract readonly icon : Readonly<string>

  draw(ctx: CanvasRenderingContext2D) {
    // TODO: Find a better way to specify type of Vector2 Generator, so this casting isn't necessary
    const coords = [...this.p] as unknown as [number, number]
    const [w, h] = this.dimensions
    ctx.font = `${h}px sans-serif`
    let x = ctx.font

    ctx.fillStyle = "#fff"
    ctx.fillText(this.icon, ...coords)
    ctx.textBaseline = "middle"
    ctx.textAlign = "center"
  }
}
