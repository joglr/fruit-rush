import { Player } from "./Player"
import { html } from "htm/preact"
import { FunctionComponent, h, VNode } from "preact"
import { displaceables, gameState, GameStatus, reset } from "./gameState"
import { calcFPS, getFoodSpawnRate, getPlayersAlive } from "./util"
import { DEBUG, getGitMetadata, GitMetadata } from "./debug"
import { formatDistance, formatISO9075 } from "date-fns"

export function getUI(
  timeStamp: number,
  lastFrameTime: number,
  deltaT: number,
  players: Set<Player>,
  status: GameStatus
): VNode<Record<string, never>> {
  return html` ${DEBUG
      ? html`<${Debug}
          players=${players}
          timeStamp=${timeStamp}
          lastFrameTime=${lastFrameTime}
          deltaT=${deltaT}
        />`
      : null}
    <${Guide} status=${status} players=${players} />
    <${Scoreboard} players=${players} />`
}

function Scoreboard(players: Set<Player>) {
  return html` <div id="scoreboard">
    ${Array.from(players).map(
      (p) => html`<${PlayerColoredSpan} player=${p}>
        ${p.getPlayerScoreboardString(gameState.getState())}
      <//> `
    )}
  </div>`
}

interface DebugProps {
  players: Set<Player>
  timeStamp: number
  lastFrameTime: number
  deltaT: number
}

function Debug({ players, timeStamp, lastFrameTime, deltaT }: DebugProps) {
  const metadata = getGitMetadata()
  const fpsString = `fps ${calcFPS(
    lastFrameTime,
    timeStamp
  ).toFixed()} (Δt = ${deltaT.toFixed(3)})`

  return html`<div id="debug">
    <div>
      ${fpsString}${metadata
        ? html`<${Metadata} metadata=${metadata} />`
        : null}
    </div>
    FoodSpawnRate: ${getFoodSpawnRate(players.size)} Entities:
    ${displaceables.size}
    ${Array.from(players).map((p) => {
      const mv = p.getInputDevice().getMovementVector()
      const mvs = mv.toArray()[0].toString()

      const threeDecimals = (x: number) =>
        `${x < 0 ? "" : " "}${x.toFixed(3).toString()}`
      const av = p.getInputDevice().getAimVector().toArray().toString()
      const pp = p.getP().toArray().map(threeDecimals).toString()
      const pv = p.getV().toArray().map(threeDecimals).toString()
      const pa = p.getA().toArray().map(threeDecimals).toString()

      return html` <div class="player-info" style=${`color: ${p.getColor()};`}>
        ${`${p.getPlayerStatusString()}
 mov:  ${mvs}
 aim:  ${av}
 p:   ${pp}
 v:   ${pv}
 |v|: ${threeDecimals(p.getV().getMagnitude())}
 a:   ${pa}
 j:    ${p.getInputDevice().getJumpButtonIsDown()}`}
      </div>`
    })}
  </div>`
}

function Metadata({ metadata }: { metadata: GitMetadata }) {
  const commitDate = new Date(metadata.time)
  const now = new Date().getTime()

  return html` ${metadata
    ? html`[<a
          href="https://github.com/joglr/fruit-rush/commit/${metadata.hash}"
          target="_blank"
          >${metadata.hash}</a
        >] ${metadata.subject}${" "}
        <em title=${formatISO9075(commitDate)}
          >(${formatDistance(commitDate, now, {
            addSuffix: true,
          })})</em
        >`
    : null}`
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
            <h1>Fruit Rush <span>🐒🍉</span></h1>
            <title id="helptext">Press any button / key to join the game!</h2>
            <p><span>🎮</span> or <span>⌨</span></p>
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
              <${PlayerColoredSpan} player=${getPlayersAlive(players)[0]}>
                ${getPlayersAlive(players)[0].getPlayerStatusString(" wins!")}
              <//>
            </p>`
          : null}
        <button
          onclick=${reset}
          style="margin: 16px auto; padding: 8px; cursor: pointer;"
        >
          Restart game
        </button>
      </div>`
    }
    default:
      return html`error`
  }
}

const PlayerColoredSpan: FunctionComponent<{ player: Player }> = (props) => {
  return h(
    "span",
    {
      style: `color: ${props.player.getColor()}`,
    },
    props.children
  )
}
