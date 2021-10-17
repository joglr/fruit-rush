import { State } from "./../modules/State"

const defaultState = {
  hello: "world"
}

let state = new State(defaultState)

beforeEach(() => {
  state = new State(defaultState)
})

describe("State", () => {
  it("update the state when passed a new state object", () => {
    state.setState({
      hello: "moon"
    })

    expect(state.getState().hello).toBe("moon")
  })
  it("update the state when passed a state modifier", () => {
    state.setState(prevState => ({
      hello: prevState.hello + "moon"
    }))

    expect(state.getState().hello).toBe("worldmoon")
  })
  it("notify subscribers when state is updated", () => {
    const cb = jest.fn()
    const newState = {
      hello: "callback"
    }
    state.subscribe(cb)
    state.setState(newState)
    expect(cb).toHaveBeenCalledWith({ hello: "callback" })
  })
})
