const getSoundPath = (x: string) => `./sounds/${x}.wav`;
// x === "kebab" ? `./sounds/${x}.mp3` :
const sounds = {
  jump: 0,
  hit: 1,
  shoot: 2,
  eat: 3,
  eat_bad: 4,
  // "kebab": 4
};
const audios = Object.keys(sounds).map((s) => {
  const a = document.createElement("audio");
  a.src = getSoundPath(s);

  a.volume = 0.5;
  // (s === "kebab") ? 1 :
  return () => {
    a.pause();
    a.currentTime = 0;
    a.play();
  };
});

export const playSFX = (key: keyof typeof sounds) => audios[sounds[key]]();
