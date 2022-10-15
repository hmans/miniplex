import { createQueue } from "../src"

describe("createQueue", () => {
  it("should create a queue", () => {
    const queue = createQueue()
    expect(queue).toBeInstanceOf(Function)
  })

  it("should add a function to the queue", () => {
    const queue = createQueue()
    const fn = jest.fn()
    queue(fn)

    expect(queue.flush).toBeInstanceOf(Function)
    queue.flush()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  describe("flush", () => {
    it("should flush the queue", () => {
      const queue = createQueue()
      const fn = jest.fn()
      queue(fn)

      queue.flush()

      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe("clear", () => {
    it("should clear the queue", () => {
      const queue = createQueue()
      const fn = jest.fn()
      queue(fn)
      queue.clear()
      queue.flush()
      expect(fn).not.toHaveBeenCalled()
    })
  })
})
