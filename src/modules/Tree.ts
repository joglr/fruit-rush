import { Positionable } from "./Positionable.js";
import { pick } from "./util.js";

export class Tree extends Positionable {
  constructor(position: [number, number]) {
    super(position);
    super.getDOMElement().textContent = pick(["🌳", "🌲"]);
  }
}
