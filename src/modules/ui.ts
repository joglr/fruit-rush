import { Player } from "./Player"
import { html } from "htm/preact"
import { h, VNode } from "preact"
import { gameState, GameStatus, reset } from "./gameState"

export function getUI(
  players: Set<Player>,
  status: GameStatus
): VNode<Record<string, never>> {
  return html`<${Guide} status=${status} players=${players.size} />
    <div id="scoreboard">
      ${Array.from(players).map((p) => {
        return h(
          "div",
          {
            style: `color: ${p.getColor()}`,
          },
          p.getPlayerScoreboardString(gameState.getState())
        )
      })}
    </div>`
}

function Guide({
  status,
  players,
}: {
  status: GameStatus
  players: number
}): VNode<Record<string, never>> {
  switch (status) {
    case GameStatus.IDLE: {
      if (players == 0) {
        return html`
          <div id="intro">
            <h1>Fruit Rush 🐒🍉</h1>
            <title id="helptext">Press any button / key to join the game!</h2>
            <p>🎮 or ⌨</p>
            <b>Controls:</b>

            <div></div>
          </div>
        `
      } else return html`When you are ready, hold down a button!`
    }
    case GameStatus.RUNNING: {
      return html``
    }
    case GameStatus.GAME_OVER: {
      return html`<div
        style="background-color: black; padding: 16px; font-size: 30px;"
      >
        Game over!
        <button onclick=${reset}>Restart game</button>
      </div>`
    }
    default:
      return html`error`
  }
}
