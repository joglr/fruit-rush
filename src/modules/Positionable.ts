export interface Positionable {
  getPosition(): [number, number]
  // getDimensions(): [number, number]
  getDOMElement(): HTMLDivElement
}
