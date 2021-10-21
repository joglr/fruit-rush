type StateReceiver<T> = (s: T) => void
type StateModifier<T> = (s: T) => T
type Unsubcriber = () => void

export class State<T> {
  private initialState
  private state
  private subscriptions

  constructor(initialState: T) {
    this.initialState = initialState
    this.state = initialState
    this.subscriptions = new Set<StateReceiver<T>>()
  }

  getState() {
    return this.state
  }

  setState(newStateOrMutator: T | StateModifier<T>) {
    if (newStateOrMutator instanceof Function) {
      this.state = newStateOrMutator(this.getState())
    } else {
      this.state = newStateOrMutator
    }
    for (const calllback of this.subscriptions) {
      calllback(this.state)
    }
  }

  reset() {
    this.setState(this.initialState)
  }

  subscribe(callback: StateReceiver<T>) {
    this.subscriptions.add(callback)
    return (() => {
      this.subscriptions.delete(callback)
    }) as Unsubcriber
  }
}
