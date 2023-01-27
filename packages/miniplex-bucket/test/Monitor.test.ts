import { Bucket } from "../src"
import { Monitor } from "../src/Monitor"

describe(Monitor, () => {
  it("executes the setup callback on all entities in a query, and all future entities added to it", () => {
    /* Create a world with an entity */
    const bucket = new Bucket()
    const bar = bucket.add({ foo: "bar" })

    /* Create a monitor */
    const setup = jest.fn()
    const teardown = jest.fn()
    const monitor = new Monitor(bucket).setup(setup).teardown(teardown)

    /* The setup callback should be called with the existing entity */
    monitor.run()
    expect(setup).toHaveBeenCalledWith(bar)

    /* Add another entity. The setup callback should be called with it */
    const baz = bucket.add({ foo: "baz" })
    monitor.run()
    expect(setup).toHaveBeenCalledWith(baz)

    /* Remove all entities. The teardown callback should be called with both entities */
    bucket.clear()
    monitor.run()
    expect(teardown).toHaveBeenCalledWith(bar)
    expect(teardown).toHaveBeenCalledWith(baz)
  })
})
