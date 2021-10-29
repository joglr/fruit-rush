import {
  diarrheaRepeatRate,
  gravityAmount,
  playerJumpAmount,
  poopGunRepeatRate,
  tacoDamage,
  tacoEffectDuration,
} from "../config"
import { Diarrhea } from "./Equipables/Diarrhea"
import { PoopGun } from "./Equipables/PoopGun"
import { Icon } from "./Icon"
import { pick, Vector2 } from "./Math"
import { Player, PlayerState } from "./Player"
import { playSFX } from "./sound"

type FOOD = keyof typeof foodMap

interface FoodProperties {
  size: [number, number]
  points: number
  effect: (p: Player) => void
}

const foodScale = 4

const defaultEffect = (p: Player) => {
  playSFX("eat")
  p.state = PlayerState.EAT
  p.resetIconTimeout = window.setTimeout(() => {
    p.state = PlayerState.DEFAULT
  }, 500)
  p.addToScore(1)
}

const tacoEffect = (p: Player) => {
  if (p.state === PlayerState.DEFAULT) playSFX("eat_bad")

  p.setPrimaryActionEquipable(new Diarrhea(diarrheaRepeatRate))
  p.setVelocity(new Vector2(Math.random(), playerJumpAmount * 0.6))
  p.setAcceleration(new Vector2(0, gravityAmount * 0.5))

  p.damage(tacoDamage, () => {
    p.state = PlayerState.DIARRHEA
    window.setTimeout(() => {
      p.state = PlayerState.DEFAULT
      p.setPrimaryActionEquipable(new PoopGun(poopGunRepeatRate))
      p.setAcceleration(new Vector2(0, gravityAmount))
    }, tacoEffectDuration)
  })
  // TODO: Taco sound
  // playSFX("kebab")
  // TODO: Dihrearea effect
}

const foodMap = window.location.hash.includes("tacofest")
  ? {
      "🌮": { size: [10, 10], points: 1, effect: tacoEffect },
    }
  : {
      "🍌": { size: [13, 13], points: 1, effect: defaultEffect },
      "🍎": { size: [10, 10], points: 1, effect: defaultEffect },
      "🍏": { size: [10, 10], points: 1, effect: defaultEffect },
      "🍇": { size: [10, 10], points: 1, effect: defaultEffect },
      "🍈": { size: [17, 17], points: 1, effect: defaultEffect },
      "🍉": { size: [17, 17], points: 1, effect: defaultEffect },
      "🍊": { size: [10, 10], points: 1, effect: defaultEffect },
      "🍍": { size: [20, 20], points: 1, effect: defaultEffect },
      "🍑": { size: [10, 10], points: 1, effect: defaultEffect },
      "🍒": { size: [10, 10], points: 1, effect: defaultEffect },
      "🍓": { size: [8, 8], points: 1, effect: defaultEffect },
      "🥑": { size: [10, 10], points: 1, effect: defaultEffect },
      "🥝": { size: [9, 9], points: 1, effect: defaultEffect },
      "🍋": { size: [10, 10], points: 1, effect: defaultEffect },
      "🍐": { size: [10, 10], points: 1, effect: defaultEffect },
      "🥭": { size: [10, 10], points: 1, effect: defaultEffect },
      "🌮": { size: [10, 10], points: 1, effect: tacoEffect },
    }

export class Food extends Icon {
  icon = pick<FOOD>(Array.from(Object.keys(foodMap) as Array<FOOD>))
  private properties = foodMap[this.icon] as FoodProperties
  dimensions = Vector2.fromArray(this.properties.size.map((x) => x * foodScale))

  affect = this.properties.effect
}
