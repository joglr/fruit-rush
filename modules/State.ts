const api = {
  setState,
  getState
}

let appState = {

}

export default function init() {
  return api
}

function setState(newState) {
  appState = newState
}

function getState() {
  return { ...appState }
}