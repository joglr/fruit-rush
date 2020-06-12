import { Positionable } from "./Positionable";

export interface Updateable extends Positionable {
  update(): void
}
