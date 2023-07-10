import { queue } from "../src"

describe(queue, () => {
  it("can queue work to be executed later", () => {
    const work = jest.fn()

    queue(work)
    expect(work).not.toHaveBeenCalled()

    queue.flush()
    expect(work).toHaveBeenCalled()
  })
})
