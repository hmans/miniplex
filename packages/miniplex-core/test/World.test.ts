import { World, Bucket } from "../src"

describe("World", () => {
  it("inherits from Bucket", () => {
    const world = new World()
    expect(world).toBeDefined()
    expect(world).toBeInstanceOf(Bucket)
  })

  describe("addComponent", () => {
    it("adds a component to an entity", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      world.addComponent(entity, "name", "foo")
      expect(entity).toEqual({ count: 1, name: "foo" })
    })

    it("if the component is already on the entity, it does nothing", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      world.addComponent(entity, "count", 2)
      expect(entity).toEqual({ count: 1 })
    })

    it("touches the entity", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      const listener = jest.fn()
      world.onEntityTouched.addListener(listener)
      world.addComponent(entity, "name", "foo")
      expect(listener).toHaveBeenCalledWith(entity)
    })

    it("returns true if the entity was updated", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      expect(world.addComponent(entity, "name", "foo")).toBe(true)
    })

    it("returns false if the entity was not updated", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      expect(world.addComponent(entity, "count", 2)).toBe(false)
    })
  })

  describe("removeComponent", () => {
    it("removes a component from an entity", () => {
      const world = new World()
      const entity = world.add({ count: 1, name: "foo" })
      world.removeComponent(entity, "name")
      expect(entity).toEqual({ count: 1 })
    })

    it("if the component is not on the entity, it does nothing", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      const listener = jest.fn()

      world.onEntityTouched.addListener(listener)
      world.removeComponent(entity, "name")
      expect(entity).toEqual({ count: 1 })
      expect(listener).not.toHaveBeenCalledWith(entity)
    })

    it("touches the entity", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      const listener = jest.fn()
      world.onEntityTouched.addListener(listener)
      world.removeComponent(entity, "count")
      expect(listener).toHaveBeenCalledWith(entity)
    })

    it("returns true if the entity was updated", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      expect(world.removeComponent(entity, "count")).toBe(true)
    })

    it("returns false if the entity was not updated", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      expect(world.removeComponent(entity, "name")).toBe(false)
    })
  })

  describe("setComponent", () => {
    it("updates the value of a component on an entity", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      world.setComponent(entity, "count", 2)
      expect(entity).toEqual({ count: 2 })
    })

    it("if the component is not on the entity, it does nothing", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      const listener = jest.fn()

      world.onEntityTouched.addListener(listener)
      world.setComponent(entity, "name", "foo")
      expect(entity).toEqual({ count: 1 })
      expect(listener).not.toHaveBeenCalledWith(entity)
    })

    it("touches the entity", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      const listener = jest.fn()
      world.onEntityTouched.addListener(listener)
      world.setComponent(entity, "count", 2)
      expect(listener).toHaveBeenCalledWith(entity)
    })

    it("returns true if the entity was updated", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      expect(world.setComponent(entity, "count", 2)).toBe(true)
    })

    it("returns false if the entity was not updated", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      expect(world.setComponent(entity, "name", "foo")).toBe(false)
    })
  })

  describe("archetype", () => {
    it("creates a derived bucket that holds entities with a specific set of components", () => {
      const world = new World()
      const entity = world.add({ count: 1, name: "foo" })
      const bucket = world.archetype("count")
      expect(bucket.entities).toEqual([entity])
    })

    it("returns the same bucket object for the same components", () => {
      const world = new World()
      const bucket1 = world.archetype("count")
      const bucket2 = world.archetype("count")
      expect(bucket1).toBe(bucket2)
    })

    it("normalizes the specified components for the equality check", () => {
      const world = new World()
      const bucket1 = world.archetype("name", "count", "")
      const bucket2 = world.archetype("count", undefined!, "name")
      expect(bucket1).toBe(bucket2)
    })
  })
})
