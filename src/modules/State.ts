
type StateReceiver<T> = (s: T) => void
type StateModifier<T> = (s: T) => T
type Unsubcriber = () => void

export class State<T> {
  private initialState
  private currentState
  private subscriptions

  constructor(initialState: T) {
    this.initialState = initialState
    this.currentState = initialState
    this.subscriptions = new Set<StateReceiver<T>>()
  }

  getState() {
    return this.currentState
  }

  setState(newStateOrMutator: T | StateModifier<T>) {
    if (newStateOrMutator instanceof Function) {
      this.currentState = newStateOrMutator(this.currentState)
    } else {
      this.currentState = newStateOrMutator
    }
    for (const calllback of this.subscriptions) {
      calllback(this.currentState)
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
