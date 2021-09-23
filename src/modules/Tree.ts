import { Icon } from "./Icon";
import { pick } from "./Math";

export class Tree extends Icon {
  icon
  constructor(position: [number, number]) {
    super(position);
    this.icon = pick(["🌳", "🌲"])
  }
}
