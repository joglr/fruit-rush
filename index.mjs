import State from './modules/State.mjs'
const state = State()

const mapConfig = {
    areaSize: 16,
    modelSize: 16,
    imageSize: 12
}

const player = '🐨'
const gameContainer = document.querySelector('#game')
const infoContainer = document.querySelector('#info')
let gamepadIndex

const div = document.createElement('div')
div.textContent = player

gameContainer.appendChild(div)


window.addEventListener('gamepadconnected', (e) => {
    gamepadIndex = e.gamepad.index

    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length)

    requestAnimationFrame(gameLoop)
})

window.addEventListener('gamepaddisconnected', () => {
    cancelAnimationFrame(gameLoop)
})

function gameLoop() {
    info.textContent = navigator.getGamepads()[gamepadIndex].timestamp

    requestAnimationFrame(gameLoop)
}

const numbers = [1,2,3,4,5]

numbers.map(square)

function square(x) { 
    return x*x; 

}

console.log(numbers.map(square))
