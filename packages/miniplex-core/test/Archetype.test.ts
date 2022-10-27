import { World } from "../src"
import { Archetype } from "../src/Archetype"

describe("Archetype", () => {
  type Entity = { name: string; age?: number }

  it("is constructed with a query that represents the entities of this archetype", () => {
    const archetype = new Archetype<Entity>({ all: ["name"] })
    expect(archetype.query).toEqual({ all: ["name"] })
  })

  describe("matchesEntity", () => {
    it("returns true if the entity has 'all' components", () => {
      const archetype = new Archetype<Entity>({ all: ["age"] })
      const entity = { name: "John", age: 42 }
      expect(archetype.matchesEntity(entity)).toBe(true)
    })

    it("returns false if the entity doesn't have 'all' components", () => {
      const archetype = new Archetype<Entity>({ all: ["age"] })
      const entity = { name: "John" }
      expect(archetype.matchesEntity(entity)).toBe(false)
    })

    it("returns true if the entity has 'any' components", () => {
      const archetype = new Archetype<Entity>({ any: ["age"] })
      const entity = { name: "John", age: 42 }
      expect(archetype.matchesEntity(entity)).toBe(true)
    })

    it("returns false if the entity doesn't have 'any' components", () => {
      const archetype = new Archetype<Entity>({ any: ["age"] })
      const entity = { name: "John" }
      expect(archetype.matchesEntity(entity)).toBe(false)
    })

    it("returns true if the entity doesn't have 'none' components", () => {
      const archetype = new Archetype<Entity>({ none: ["age"] })
      const entity = { name: "John" }
      expect(archetype.matchesEntity(entity)).toBe(true)
    })

    it("returns false if the entity has 'none' components", () => {
      const archetype = new Archetype<Entity>({ none: ["age"] })
      const entity = { name: "John", age: 42 }
      expect(archetype.matchesEntity(entity)).toBe(false)
    })
  })

  describe("onEntityRemoved", () => {
    it("is invoked when an entity leaves the archetype", () => {
      const world = new World<Entity>()

      const archetype = world.archetype({ all: ["age"] })
      const callback = jest.fn()
      archetype.onEntityRemoved.add(callback)

      const entity = world.add({ name: "John", age: 42 })
      expect(callback).not.toHaveBeenCalled()

      world.removeComponent(entity, "age")

      expect(callback).toHaveBeenCalledWith(entity)
    })

    it("is invoked before the component is actually removed from the entity", () => {
      const world = new World<Entity>()
      const archetype = world.archetype({ all: ["age"] })

      /* Set up a callback */
      let age: number | undefined
      const callback = jest.fn((entity: Entity) => {
        age = entity.age
      })
      archetype.onEntityRemoved.add(callback)

      /* Add an entity */
      const entity = world.add({ name: "John", age: 42 })

      /* Remove the 'age' component */
      world.removeComponent(entity, "age")

      /* Verify that the callback was invoked before the component was removed */
      expect(callback).toHaveBeenCalledWith(entity)
      expect(age).toBe(42)
    })
  })
})
