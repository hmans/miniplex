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

  describe("setup", () => {
    it("returns the monitor", () => {
      const monitor = new Monitor(new Bucket())
      expect(monitor.setup(() => {})).toBe(monitor)
    })

    it("registers a callback to be run for every item that has been or will be added to the bucket", () => {
      const bucket = new Bucket()
      const monitor = new Monitor(bucket)

      const setup = jest.fn()
      monitor.setup(setup)

      const bar = bucket.add({ foo: "bar" })
      monitor.run()
      expect(setup).toHaveBeenCalledWith(bar)

      const baz = bucket.add({ foo: "baz" })
      monitor.run()
      expect(setup).toHaveBeenCalledWith(baz)
    })

    it("can be run multiple times to register multiple callbacks", () => {
      const bucket = new Bucket()
      const monitor = new Monitor(bucket)

      const setup1 = jest.fn()
      const setup2 = jest.fn()
      monitor.setup(setup1).setup(setup2)

      const bar = bucket.add({ foo: "bar" })
      monitor.run()
      expect(setup1).toHaveBeenCalledWith(bar)
      expect(setup2).toHaveBeenCalledWith(bar)
    })
  })

  describe("teardown", () => {
    it("returns the monitor", () => {
      const monitor = new Monitor(new Bucket())
      expect(monitor.teardown(() => {})).toBe(monitor)
    })

    it("registers a callback to be run for every item that has been removed from the bucket", () => {
      const bucket = new Bucket()
      const monitor = new Monitor(bucket)

      const teardown = jest.fn()
      monitor.teardown(teardown)

      const bar = bucket.add({ foo: "bar" })
      bucket.remove(bar)
      monitor.run()
      expect(teardown).toHaveBeenCalledWith(bar)
    })

    it("can be run multiple times to register multiple callbacks", () => {
      const bucket = new Bucket()
      const monitor = new Monitor(bucket)

      const teardown1 = jest.fn()
      const teardown2 = jest.fn()
      monitor.teardown(teardown1).teardown(teardown2)

      const bar = bucket.add({ foo: "bar" })
      bucket.remove(bar)
      monitor.run()
      expect(teardown1).toHaveBeenCalledWith(bar)
      expect(teardown2).toHaveBeenCalledWith(bar)
    })
  })

  describe("stop", () => {
    it("returns the monitor", () => {
      const monitor = new Monitor(new Bucket())
      expect(monitor.stop()).toBe(monitor)
    })

    it("stops the monitor from running callbacks when entities are added or removed", () => {
      const bucket = new Bucket()
      const monitor = new Monitor(bucket)

      const setup = jest.fn()
      const teardown = jest.fn()
      monitor.setup(setup).teardown(teardown)

      const bar = bucket.add({ foo: "bar" })
      monitor.run()
      expect(setup).toHaveBeenCalledWith(bar)

      monitor.stop()

      const baz = bucket.add({ foo: "baz" })
      monitor.run()
      expect(setup).not.toHaveBeenCalledWith(baz)

      bucket.remove(bar)
      monitor.run()
      expect(teardown).not.toHaveBeenCalledWith(bar)
    })
  })

  describe("run", () => {
    it("returns the monitor", () => {
      const monitor = new Monitor(new Bucket())
      expect(monitor.run()).toBe(monitor)
    })

    it("runs the queued setup and teardown callbacks for all entities in the bucket", () => {
      const bucket = new Bucket()
      const monitor = new Monitor(bucket)

      const setup = jest.fn()
      const teardown = jest.fn()
      monitor.setup(setup).teardown(teardown)

      const bar = bucket.add({ foo: "bar" })
      const baz = bucket.add({ foo: "baz" })
      monitor.run()
      expect(setup).toHaveBeenCalledWith(bar)
      expect(setup).toHaveBeenCalledWith(baz)

      bucket.remove(bar)
      monitor.run()
      expect(teardown).toHaveBeenCalledWith(bar)
      expect(teardown).not.toHaveBeenCalledWith(baz)
    })
  })
})
