import { World } from "../src"
import { Monitor } from "../src/monitor"
import { Entity } from "./core.test"

describe(Monitor, () => {
  it("executes the setup callback on all entities in a query, and all future entities added to it", () => {
    /* Create a world with an entity */
    const world = new World<Entity>()
    const john = world.add({ name: "John", age: 30 })

    /* Create a query */
    const query = world.with("age")

    /* Create a monitor */
    const setup = jest.fn()
    const teardown = jest.fn()
    const monitor = query.monitor(setup, teardown)

    /* The setup callback should be called with the existing entity */
    monitor.run()
    expect(setup).toHaveBeenCalledWith(john)

    /* Add another entity. The setup callback should be called with it */
    const jane = world.add({ name: "Jane", age: 25 })
    monitor.run()
    expect(setup).toHaveBeenCalledWith(jane)

    /* Remove all entities. The teardown callback should be called with both entities */
    world.clear()
    monitor.run()
    expect(teardown).toHaveBeenCalledWith(john)
    expect(teardown).toHaveBeenCalledWith(jane)
  })

  describe("connect", () => {
    it("returns the monitor instance", () => {
      const world = new World<Entity>()
      const monitor = world.with("age").monitor()
      expect(monitor.connect()).toBe(monitor)
    })
  })

  describe("disconnect", () => {
    it("returns the monitor instance", () => {
      const world = new World<Entity>()
      const monitor = world.with("age").monitor()
      expect(monitor.disconnect()).toBe(monitor)
    })
  })
})
