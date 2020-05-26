import State from './modules/State.mjs'
import Gamepad from './modules/Gamepad.mjs'

const state = State()

const mapConfig = {
    areaSize: 16,
    modelSize: 16,
    imageSize: 12
}

const player = '🐨'
const gameContainer = document.querySelector('#game')
const infoContainer = document.querySelector('#info')
let lastAnimationFrameID 
let gamepadIndex = null

const div = document.createElement('div')
div.textContent = player

gameContainer.appendChild(div)

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
    infoContainer.textContent = navigator.getGamepads()[gamepadIndex].timestamp.toString()

    requestAnimationFrame(gameLoop)
}

const numbers = [1,2,3,4,5]

numbers.map(square)

function square(x) { 
    return x * x; 

}

interface GamepadEvent extends Event {
    gamepad: Gamepad
}

interface Gamepad {
    buttons: GamepadButton[]
    axes: GamepadAxis[],
    index: Number,
    id: String
}

interface GamepadButton {

}

interface GamepadAxis {

}

interface GamepadAxis {
    
}interface GamepadAxis {
    
}