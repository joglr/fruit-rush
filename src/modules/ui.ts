import { Player } from "./Player"
import { html } from "htm/preact"
import { h, VNode } from "preact"
import { gameState, GameStatus, reset } from "./gameState"
import { getPlayersAlive } from "./util"

export function getUI(
  players: Set<Player>,
  status: GameStatus
): VNode<Record<string, never>> {
  return html`<${Guide} status=${status} players=${players} />
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
  players: Set<Player>
}): VNode<Record<string, never>> {
  switch (status) {
    case GameStatus.IDLE: {
      if (players.size == 0) {
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
        style="background-color: black; padding: 16px; font-size: 30px; display: grid; place-items: center"
      >
        <p style="font-size: 60px;">Game over!</p>
        ${getPlayersAlive(players).length === 1
          ? html`<p>
              The winner is:
              ${getPlayersAlive(players)[0].getPlayerStatusString("")}
            </p>`
          : null}
        <button
          onclick=${reset}
          style="margin: auto; padding: 8px; cursor: pointer;"
        >
          Restart game
        </button>
      </div>`
    }
    default:
      return html`error`
  }
}
