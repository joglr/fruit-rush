import jump from "./../../sounds/jump.wav"
import hit from "./../../sounds/hit.wav"
import shoot from "./../../sounds/shoot.wav"
import eat from "./../../sounds/eat.wav"
import eat_bad from "./../../sounds/eat_bad.wav"
import diarrhea from "./../../sounds/diarrhea.wav"
// import kebab from "./../../sounds/kebab.mp3"
const sounds = {
  jump,
  hit,
  shoot,
  eat,
  eat_bad,
  diarrhea,
  // "kebab,
}
const audios = Object.values(sounds).map((s) => {
  const a = document.createElement("audio")
  a.src = s
  a.preload = "auto"

  a.volume = 0.25
  return () => {
    a.pause()
    a.currentTime = 0
    a.play()
  }
})

export const playSFX = (key: keyof typeof sounds) =>
  audios[Object.keys(sounds).indexOf(key)]()
