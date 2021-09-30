import { tacoDamage, tacoEffectDuration } from "../config"
import { Icon } from "./Icon"
import { pick, Vector2 } from "./Math"
import { Player, PlayerState } from "./Player"
import { playSFX } from "./sound"

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
  | "🌮"

interface FoodProperties {
  size: [number, number]
  effect: Function
  points: number
}

const multiplier = 4


const defaultEffect = (p: Player) => {
  playSFX("eat")
  p.icon = PlayerState.EAT
  p.resetIconTimeout = setTimeout(() => {
    p.icon = PlayerState.DEFAULT
  }, 500)
  p.addToScore(1)
}

const tacoEffect = (p: Player) => {
  playSFX("eat_bad")
  p.damage(tacoDamage, () => {
    p.hasDiarrhea = true
    setTimeout(() => {
      p.hasDiarrhea = false;
    }, tacoEffectDuration)
  })
  // TODO: Taco sound
  // playSFX("kebab")
  // TODO: Dihrearea effect
}

const foodMap: Map<FOOD, FoodProperties> = new Map<FOOD, FoodProperties>([
  ["🍌", { size: [13, 13], points: 1, effect: defaultEffect }],
  ["🍎", { size: [10, 10], points: 1, effect: defaultEffect }],
  ["🍏", { size: [10, 10], points: 1, effect: defaultEffect }],
  ["🍇", { size: [10, 10], points: 1, effect: defaultEffect }],
  ["🍈", { size: [17, 17], points: 1, effect: defaultEffect }],
  ["🍉", { size: [17, 17], points: 1, effect: defaultEffect }],
  ["🍊", { size: [10, 10], points: 1, effect: defaultEffect }],
  ["🍍", { size: [20, 20], points: 1, effect: defaultEffect }],
  ["🍑", { size: [10, 10], points: 1, effect: defaultEffect }],
  ["🍒", { size: [10, 10], points: 1, effect: defaultEffect }],
  ["🍓", { size: [8, 8], points: 1, effect: defaultEffect }],
  ["🥑", { size: [10, 10], points: 1, effect: defaultEffect }],
  ["🥝", { size: [9, 9], points: 1, effect: defaultEffect }],
  ["🍋", { size: [10, 10], points: 1, effect: defaultEffect }],
  ["🍐", { size: [10, 10], points: 1, effect: defaultEffect }],
  ["🥭", { size: [10, 10], points: 1, effect: defaultEffect }],
  ["🌮", { size: [10, 10], points: 1, effect: tacoEffect }],
])

export class Food extends Icon {
  icon = pick<FOOD>(Array.from(foodMap.keys()))
  private properties = foodMap.get(this.icon)
  dimensions = Vector2.fromArray(this.properties!.size.map(x => x * multiplier))
  affect = this.properties!.effect
}
