import { Icon } from "./Icon"
import { pick, Vector2 } from "./Math"

type FOOD =
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

const sizeMap: Map<FOOD, [number, number]> = new Map<FOOD, [number, number]>([
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

export class Food extends Icon {
  icon = pick<FOOD>([
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
}
