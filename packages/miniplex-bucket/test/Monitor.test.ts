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
    new Monitor(bucket).onAdd(setup).onRemove(teardown)

    /* The setup callback should be called with the existing entity */
    expect(setup).toHaveBeenCalledWith(bar)

    /* Add another entity. The setup callback should be called with it */
    const baz = bucket.add({ foo: "baz" })
    expect(setup).toHaveBeenCalledWith(baz)

    /* Remove all entities. The teardown callback should be called with both entities */
    bucket.clear()
    expect(teardown).toHaveBeenCalledWith(bar)
    expect(teardown).toHaveBeenCalledWith(baz)
  })

  describe("onAdd", () => {
    it("returns the monitor", () => {
      const monitor = new Monitor(new Bucket())
      expect(monitor.onAdd(() => {})).toBe(monitor)
    })

    it("registers a callback to be run for every item that has been or will be added to the bucket", () => {
      const bucket = new Bucket()
      const monitor = new Monitor(bucket)

      const setup = jest.fn()
      monitor.onAdd(setup)

      const bar = bucket.add({ foo: "bar" })
      expect(setup).toHaveBeenCalledWith(bar)

      const baz = bucket.add({ foo: "baz" })
      expect(setup).toHaveBeenCalledWith(baz)
    })

    it("can be run multiple times to register multiple callbacks", () => {
      const bucket = new Bucket()
      const monitor = new Monitor(bucket)

      const setup1 = jest.fn()
      const setup2 = jest.fn()
      monitor.onAdd(setup1).onAdd(setup2)

      const bar = bucket.add({ foo: "bar" })
      expect(setup1).toHaveBeenCalledWith(bar)
      expect(setup2).toHaveBeenCalledWith(bar)
    })
  })

  describe("onRemove", () => {
    it("returns the monitor", () => {
      const monitor = new Monitor(new Bucket())
      expect(monitor.onRemove(() => {})).toBe(monitor)
    })

    it("registers a callback to be run for every item that has been removed from the bucket", () => {
      const bucket = new Bucket()
      const monitor = new Monitor(bucket)

      const teardown = jest.fn()
      monitor.onRemove(teardown)

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
      monitor.onRemove(teardown1).onRemove(teardown2)

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
      monitor.onAdd(setup).onRemove(teardown)

      const bar = bucket.add({ foo: "bar" })
      expect(setup).toHaveBeenCalledWith(bar)

      monitor.stop()

      const baz = bucket.add({ foo: "baz" })
      expect(setup).not.toHaveBeenCalledWith(baz)

      bucket.remove(bar)
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
      monitor.onAdd(setup).onRemove(teardown)

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

  describe("manual", () => {
    it("returns the monitor instance", () => {
      const monitor = new Monitor(new Bucket())
      expect(monitor.manual()).toBe(monitor)
    })

    it("sets the monitor to manual mode", () => {
      const monitor = new Monitor(new Bucket())
      expect(monitor.isAutomatic).toBe(true)
      monitor.manual()
      expect(monitor.isAutomatic).toBe(false)
      expect(monitor.isManual).toBe(true)
    })

    it("when manual mode is enabled, callbacks are queued until .run() is invoked", () => {
      const bucket = new Bucket()
      const monitor = bucket.monitor().manual()

      const setup = jest.fn()
      const teardown = jest.fn()
      monitor.onAdd(setup).onRemove(teardown)

      const bar = bucket.add({ foo: "bar" })
      expect(setup).not.toHaveBeenCalledWith(bar)
      monitor.run()
      expect(setup).toHaveBeenCalledWith(bar)

      bucket.remove(bar)
      expect(teardown).not.toHaveBeenCalledWith(bar)
      monitor.run()
      expect(teardown).toHaveBeenCalledWith(bar)

      /* Now disable immediate mode */
      monitor.automatic()

      const baz = bucket.add({ foo: "baz" })
      expect(setup).toHaveBeenCalledWith(baz)
    })
  })
})
