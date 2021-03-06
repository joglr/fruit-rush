import { fruitSpawnIntervalMilliseconds } from "../config"
import { Player } from "./Player"

export function getWH(): [number, number] {
  return [window.innerWidth, window.innerHeight]
}

export function getPlayersAlive(players: Set<Player>) {
  return Array.from(players).filter((p) => !p.dead)
}

export function calcFPS(lastFrameTime: number, timestamp: number) {
  return lastFrameTime === undefined ? 0 : 1000 / (timestamp - lastFrameTime)
}

export function getFoodSpawnRate(players: number) {
  return fruitSpawnIntervalMilliseconds / (0.5 + players / 2)
}
