export abstract class Positionable {

  protected position: [number, number] = [0, 0];
  protected dimensions: [number, number] = [22, 22];
  protected DOMElement: HTMLDivElement = document.createElement('div');

  constructor(position: [number, number]) {
    this.position = position
    this.DOMElement = document.createElement('div')
    this.DOMElement.textContent = '????'
    this.DOMElement.classList.add('positionable')
  }
  
  getPosition(): [number, number] {
    return this.position
  }
  setPosition(position: [number, number]): void {
    this.position = position
  }
  
  getDimensions(): [number, number] {
    return this.dimensions
  }
  setDimensions(dimensions: [number, number]): void {
    this.dimensions = dimensions
  }

  getDOMElement() {
    return this.DOMElement
  }

  intersectsWith(p : Positionable): boolean {
    const [aw,ah] = this.getDimensions()
    const [bw,bh] = p.getDimensions()

    let [minAx,minAy] = this.getPosition()
    let [minBx,minBy] = p.getPosition()
    let [maxAx, maxAy] = [minAx + aw, minAy + ah]
    let [maxBx, maxBy] = [minBx + bw, minBy + bh]

    // // Intersection of two rectangles
    
    return maxAx >= minBx && minAx <= maxBx && minAy <= maxBy && maxAy >= minBy
  }
}
