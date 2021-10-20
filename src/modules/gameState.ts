import { State } from "./State"

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
