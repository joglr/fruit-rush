// import State from './modules/State'
// import Gamepad from './modules/Gamepad'
// const state = State()

const mapConfig = {
    areaSize: 16,
    modelSize: 16,
    imageSize: 12
}

const playerIcon = '🐨'
const gameContainer = document.querySelector('#game')
const infoContainer = document.querySelector('#info')
let lastAnimationFrameID 
let gamepadIndex = null

const playerElement = document.createElement('div')
playerElement.textContent = playerIcon

gameContainer.appendChild(playerElement)

setInterval(() => {
    if (gamepadIndex !== null) {
        navigator.getGamepads()[gamepadIndex].hapticActuators
    }
}, 1000)

window.addEventListener('gamepadconnected', (e : GamepadEvent) => {
    gamepadIndex = e.gamepad.index

    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length)

    lastAnimationFrameID = requestAnimationFrame(gameLoop)
})

window.addEventListener('gamepaddisconnected', (e : GamepadEvent) => {
    cancelAnimationFrame(lastAnimationFrameID)
})

function gameLoop() {
    // infoContainer.textContent = navigator.getGamepads()[gamepadIndex].timestamp.toString()

    infoContainer.textContent = navigator.getGamepads()[0].axes.toString();

    let leftStickX = navigator.getGamepads()[0].axes[0];
    let leftStickY = navigator.getGamepads()[0].axes[1];
    let rightStickX = navigator.getGamepads()[0].axes[2];
    let rightStickY = navigator.getGamepads()[0].axes[3];

    infoContainer.innerHTML = `
    <div>leftStickX = ${leftStickX}</div>
    <div>leftStickY = ${leftStickY}</div>
    <div>rightStickX = ${rightStickX}</div>
    <div>rightStickY = ${rightStickY}</div>
    
    `

    updateGameState(navigator.getGamepads()[0]);

    render();
    
    requestAnimationFrame(gameLoop)
}

// Render

function render() {
    playerElement.style.transform = `translate(${playerPosition[0]}px,${playerPosition[1]}px)`
}

// Game state

function updateGameState(gamepad : Gamepad) {

    let leftStickX = navigator.getGamepads()[0].axes[0];
    let leftStickY = navigator.getGamepads()[0].axes[1];
    movePlayerRelatively(leftStickX,leftStickY);
}

let playerPosition : [number,number]

playerPosition = [0,0]

function movePlayerRelatively(dx : number, dy : number) {
    playerPosition[0] += dx;
    playerPosition[1] += dy;
}

