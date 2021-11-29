import { Displaceable } from "./Displaceable"
import { InputDevice } from "./InputDevice"
import { Player } from "./Player"
import { State } from "./State"
import { getWH } from "./util"

export enum GameStatus {
  IDLE,
  RUNNING,
  GAME_OVER,
}

export interface GameState {
  status: GameStatus
}

const initialState: GameState = {
  status: GameStatus.IDLE,
}

export const gameState = new State<GameState>(initialState)

export let players: Set<Player> = new Set()
export let displaceables: Set<Displaceable> = new Set()

export function reset() {
  gameState.reset()
  players = new Set(
    Array.from(players).map((player) =>
      player.reset(getWH().map((x) => x / 2) as [number, number])
    )
  )
  displaceables = new Set<Displaceable>()
  players.forEach((p) => displaceables.add(p))
  gameState.setState({ status: GameStatus.RUNNING })
}

const playerColors = ["#4e87f2", "#3ade52", "#f3b43f", "#ed05ca"]

export function createPlayer(inputDevice: InputDevice) {
  if (players.size === playerColors.length) return

  const player = new Player(
    players.size,
    inputDevice,
    getWH().map((x) => x / 2) as [number, number],
    playerColors[players.size]
  )

  players.add(player)
  displaceables.add(player)

  // TODO: Game should not start immediately when players connect
  if (gameState.getState().status !== GameStatus.RUNNING)
    gameState.setState({ status: GameStatus.RUNNING })

  return player
}
