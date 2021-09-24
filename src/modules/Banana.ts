import { Icon } from "./Icon"
import { pick, Vector2 } from "./Math"
import { Player } from "./Player"

type FRUIT =
  | "🍌"
  | "🍎"
  | "🍏"
  | "🍇"
  | "🍈"
  | "🍉"
  | "🍊"
  | "🍍"
  | "🍑"
  | "🍒"
  | "🍓"
  | "🥑"
  | "🥝"
  | "🍋"
  | "🍐"
  | "🥭"

const multiplier = 4

const sizeMap : Map<FRUIT, [number, number]>  =
new Map<FRUIT, [number, number]>([
  ["🍌", [13, 13]],
  ["🍎", [8, 8]],
  ["🍏", [8, 8]],
  ["🍇", [10, 10]],
  ["🍈", [5, 5]],
  ["🍉", [15, 15]],
  ["🍊", [10, 10]],
  ["🍍", [10, 10]],
  ["🍑", [10, 10]],
  ["🍒", [10, 10]],
  ["🍓", [10, 10]],
  ["🥑", [10, 10]],
  ["🥝", [10, 10]],
  ["🍋", [10, 10]],
  ["🍐", [10, 10]],
  ["🥭", [10, 10]],
])

export class Fruit extends Icon {
  icon = pick<FRUIT>([
    "🍌",
    "🍎",
    "🍏",
    "🍇",
    "🍈",
    "🍉",
    "🍊",
    "🍍",
    "🍑",
    "🍒",
    "🍓",
    "🥑",
    "🥝",
    "🍋",
    "🍐",
    "🥭",
  ])
  dimensions = Vector2.fromArray(sizeMap.get(this.icon)!.map(x => x * multiplier))

  static healAmount = Player.initialHealth
  //   static healAmount = 5
}
