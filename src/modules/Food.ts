import {
  diarrheaRepeatRate,
  gravityAmount,
  playerJumpAmount,
  pointsIndicatorFontColor,
  pointsIndicatorFont,
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

type Effect = (f: Food) => (p: Player) => void
interface FoodProperties {
  size: [number, number]
  points: number
  effect: Effect
}

const foodScale = 4

const defaultEffect: Effect = (f: Food) => (p: Player) => {
  playSFX("eat")
  p.state = PlayerState.EAT
  p.resetIconTimeout = window.setTimeout(() => {
    p.state = PlayerState.DEFAULT
  }, 500)
  p.addToScore(f.points())
}

const tacoEffect: Effect = (_: Food) => (p: Player) => {
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
      "🌮": { size: [10, 10], points: -1, effect: tacoEffect },
      "🍓": { size: [8, 8], points: 1, effect: defaultEffect },
      "🥝": { size: [9, 9], points: 1, effect: defaultEffect },
      "🍋": { size: [9, 9], points: 1, effect: defaultEffect },
      "🍒": { size: [9, 9], points: 1, effect: defaultEffect },
      "🥑": { size: [10, 10], points: 1, effect: defaultEffect },
      "🍎": { size: [10, 10], points: 2, effect: defaultEffect },
      "🍏": { size: [10, 10], points: 2, effect: defaultEffect },
      "🍊": { size: [10, 10], points: 2, effect: defaultEffect },
      "🍑": { size: [10, 10], points: 2, effect: defaultEffect },
      "🍐": { size: [10, 10], points: 2, effect: defaultEffect },
      "🥭": { size: [10, 10], points: 2, effect: defaultEffect },
      "🍇": { size: [13, 13], points: 1, effect: defaultEffect },
      "🍌": { size: [13, 13], points: 2, effect: defaultEffect },
      "🍉": { size: [15, 15], points: 3, effect: defaultEffect },
      "🍍": { size: [20, 20], points: 4, effect: defaultEffect },
      "🍈": { size: [17, 17], points: 5, effect: defaultEffect },
    }

export class Food extends Icon {
  icon = pick<FOOD>(Array.from(Object.keys(foodMap) as Array<FOOD>))
  private properties = foodMap[this.icon] as FoodProperties
  points() {
    return this.properties.points
  }
  dimensions = Vector2.fromArray(this.properties.size.map((x) => x * foodScale))

  affect = (p: Player) => this.properties.effect(this)(p)

  draw(ctx: CanvasRenderingContext2D, _timeStamp: number) {
    super.draw(ctx, _timeStamp)

    // Draw points indicator in center of circle
    // If points are negative, draw white text, otherwise, draw black text

    ctx.font = pointsIndicatorFont
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = pointsIndicatorFontColor

    const prefix = this.properties.points > 0 ? "+" : "−"

    ctx.fillText(
      `${prefix}${Math.abs(this.properties.points)}`,
      ...this.getP().add(this.getDimensions().divide(2)).toArray()
    )
  }
}
