import { World } from "../src/core"
import { Monitor } from "../src/monitor"

export type Entity = {
  name: string
  age?: number
  height?: number
}

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
    const monitor = new Monitor(query).setup(setup).teardown(teardown)

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
})
