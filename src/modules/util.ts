export function randBetween(from: number, to: number) {
  return from + Math.floor(Math.random() * (to - from))
}
