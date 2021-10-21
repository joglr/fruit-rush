import { Player } from "./Player"

export function getWH(): [number, number] {
  return [window.innerWidth, window.innerHeight]
}

export function getPlayersAlive(players: Set<Player>) {
  return Array.from(players).filter((p) => !p.dead)
}
