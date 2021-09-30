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
  ["🍎", [10, 10]],
  ["🍏", [10, 10]],
  ["🍇", [10, 10]],
  ["🍈", [17, 17]],
  ["🍉", [17, 17]],
  ["🍊", [10, 10]],
  ["🍍", [20, 20]],
  ["🍑", [10, 10]],
  ["🍒", [10, 10]],
  ["🍓", [8, 8]],
  ["🥑", [10, 10]],
  ["🥝", [9, 9]],
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
