import { Player } from "./Player";

export interface Equipable {
  use(player: Player): any
}
