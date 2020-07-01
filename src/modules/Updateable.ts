import { Positionable } from "./Positionable.js";

export interface Updateable extends Positionable {
  update(): void
}
