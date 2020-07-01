import { Player } from "./Player.js";

export interface Equipable {
  use(player: Player): any
}
