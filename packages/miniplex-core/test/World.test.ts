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
      world.onEntityTouched.add(listener)
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

      world.onEntityTouched.add(listener)
      world.removeComponent(entity, "name")
      expect(entity).toEqual({ count: 1 })
      expect(listener).not.toHaveBeenCalledWith(entity)
    })

    it("touches the entity", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      const listener = jest.fn()
      world.onEntityTouched.add(listener)
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

      world.onEntityTouched.add(listener)
      world.setComponent(entity, "name", "foo")
      expect(entity).toEqual({ count: 1 })
      expect(listener).not.toHaveBeenCalledWith(entity)
    })

    it("touches the entity", () => {
      const world = new World()
      const entity = world.add({ count: 1 })
      const listener = jest.fn()
      world.onEntityTouched.add(listener)
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
})
