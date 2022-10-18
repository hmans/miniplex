import { World, Bucket } from "../src"

describe("World", () => {
  it("inherits from Bucket", () => {
    const world = new World()
    expect(world).toBeDefined()
    expect(world).toBeInstanceOf(Bucket)
  })

  describe("id", () => {
    it("returns a world-unique ID for the given entity", () => {
      const world = new World()
      const entity = world.add({})
      expect(world.id(entity)).toBe(0)

      /* It should always return the same ID for the same entity */
      expect(world.id(entity)).toBe(0)
    })

    it("returns undefined for entities that are not known to the world", () => {
      const world = new World()
      const entity = {}
      expect(world.id(entity)).toBeUndefined()
    })

    it("forgets about IDs when the entity is removed", () => {
      const world = new World()

      const entity = world.add({})
      expect(world.id(entity)).toBe(0)

      world.remove(entity)
      expect(world.id(entity)).toBeUndefined()
    })

    it("when an entity is removed and re-added, it will receive a new ID", () => {
      const world = new World()

      const entity = world.add({})
      expect(world.id(entity)).toBe(0)

      world.remove(entity)
      expect(world.id(entity)).toBeUndefined()

      world.add(entity)
      expect(world.id(entity)).toBe(1)
    })
  })

  describe("clearComponent", () => {
    it("removes a component from an entity", () => {
      const world = new World()
      const entity = world.add({ count: 1, name: "foo" })
      world.clearComponent(entity, "name")
      expect(entity).toEqual({ count: 1 })
    })

    it("does nothing if the component was not present on the entity", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      world.clearComponent(entity, "name")
      expect(entity).toEqual({ count: 1 })
    })

    it("touches the entity", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      const listener = jest.fn()
      world.onEntityTouched.addListener(listener)
      world.clearComponent(entity, "count")
      expect(listener).toHaveBeenCalledWith(entity)
    })
  })

  describe("setComponent", () => {
    it("updates the value of a component on an entity", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      world.setComponent(entity, "count", 2)
      expect(entity).toEqual({ count: 2 })
    })

    it("adds the component if it was previously missing", () => {
      const world = new World()
      const entity = world.add({})
      world.setComponent(entity, "count", 1)
      expect(entity).toEqual({ count: 1 })
    })

    it("touches the entity", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      const listener = jest.fn()
      world.onEntityTouched.addListener(listener)
      world.setComponent(entity, "count", 2)
      expect(listener).toHaveBeenCalledWith(entity)
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
