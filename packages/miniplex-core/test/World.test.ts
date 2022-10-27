import { Archetype } from "../src/Archetype"
import { World } from "../src/World"

describe("World", () => {
  describe("archetype", () => {
    it("creates an archetype for the given query", () => {
      const world = new World<{ name: string; age?: number }>()
      const archetype = world.archetype("name")
      expect(archetype).toBeDefined()
      expect(archetype).toBeInstanceOf(Archetype)
    })

    it("supports a list of components as a shortcut", () => {
      const world = new World<{ name: string; age?: number }>()
      const archetype1 = world.archetype("name")
      const archetype2 = world.archetype({ all: ["name"] })
      expect(archetype1).toBe(archetype2)
    })

    it("returns the same archetype if it already exists", () => {
      const world = new World<{ name: string; age?: number }>()
      const archetype1 = world.archetype({ all: ["name"] })
      const archetype2 = world.archetype({ all: ["name"] })
      expect(archetype1).toBe(archetype2)
    })

    it("properly normalizes queries before matching against existing archetypes", () => {
      const world = new World<{ name: string; age?: number }>()
      const archetype1 = world.archetype({ all: ["age", "name"] })
      const archetype2 = world.archetype({ all: ["name", "age"] })
      expect(archetype1).toBe(archetype2)
    })

    it("adds existing entities that match the query to the archetype", () => {
      const world = new World<{ name: string; age?: number }>()
      const entity = world.add({ name: "John", age: 42 })
      world.add({ name: "Alice" })

      const archetype = world.archetype({ all: ["age"] })
      expect(archetype.entities).toEqual([entity])
    })
  })

  describe("add", () => {
    it("adds the entity to matching archetypes", () => {
      const world = new World<{ name: string; age?: number }>()
      const archetype = world.archetype({ all: ["age"] })

      const entity = world.add({ name: "John", age: 42 })
      expect(archetype.entities).toEqual([entity])
    })
  })

  describe("remove", () => {
    it("removes the entity from all archetypes", () => {
      const world = new World<{ name: string; age?: number }>()
      const archetype = world.archetype({ all: ["age"] })

      const entity = world.add({ name: "John", age: 42 })
      expect(archetype.entities).toEqual([entity])

      world.remove(entity)
      expect(archetype.entities).toEqual([])
    })
  })

  describe("addComponent", () => {
    it("adds the component to the entity", () => {
      const world = new World<{ name: string; age?: number }>()
      const entity = world.add({ name: "John" })
      world.addComponent(entity, "age", 42)
      expect(entity).toEqual({ name: "John", age: 42 })
    })

    it("it doesn't overwrite the component if it already exists", () => {
      const world = new World<{ name: string; age?: number }>()
      const entity = world.add({ name: "John", age: 42 })
      world.addComponent(entity, "age", 43)
      expect(entity).toEqual({ name: "John", age: 42 })
    })

    it("adds the entity to matching archetypes", () => {
      const world = new World<{ name: string; age?: number }>()
      const archetype = world.archetype({ all: ["age"] })
      const entity = world.add({ name: "John" })

      expect(archetype.entities).toEqual([])

      world.addComponent(entity, "age", 42)
      expect(archetype.entities).toEqual([entity])
    })
  })

  describe("removeComponent", () => {
    it("removes the component from the entity", () => {
      const world = new World<{ name: string; age?: number }>()
      const entity = world.add({ name: "John", age: 42 })
      world.removeComponent(entity, "age")
      expect(entity).toEqual({ name: "John" })
    })

    it("removes the entity from archetype it no longer matches with", () => {
      const world = new World<{ name: string; age?: number }>()
      const archetype = world.archetype({ all: ["age"] })
      const entity = world.add({ name: "John", age: 42 })

      expect(archetype.entities).toEqual([entity])

      world.removeComponent(entity, "age")
      expect(archetype.entities).toEqual([])
    })
  })

  describe("id", () => {
    it("returns a unique ID for the given entity", () => {
      const world = new World<{ name: string; age?: number }>()
      const entity = world.add({ name: "John" })
      expect(world.id(entity)).toEqual(0)

      const entity2 = world.add({ name: "Alice" })
      expect(world.id(entity2)).toEqual(1)
    })

    it("returns undefined if the entity is not part of the world", () => {
      const world = new World<{ name: string; age?: number }>()
      const entity = { name: "John" }
      expect(world.id(entity)).toBeUndefined()
    })
  })

  describe("entity", () => {
    it("returns the entity matching the given ID", () => {
      const world = new World<{ name: string; age?: number }>()
      const entity = world.add({ name: "John" })
      const id = world.id(entity)!
      expect(world.entity(id)).toEqual(entity)
    })
  })

  describe("clear", () => {
    it("removes all known entities from the world", () => {
      const world = new World<{ name: string; age?: number }>()
      world.add({ name: "John", age: 42 })
      world.add({ name: "Alice" })
      world.clear()
      expect(world.entities).toEqual([])
    })

    it("also removes all entities from known archetypes", () => {
      const world = new World<{ name: string; age?: number }>()
      const archetype = world.archetype({ all: ["age"] })
      const john = world.add({ name: "John", age: 42 })
      world.add({ name: "Alice" })
      expect(archetype.entities).toEqual([john])
      world.clear()
      expect(archetype.entities).toEqual([])
    })
  })
})
