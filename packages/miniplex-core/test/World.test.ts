import { Archetype } from "../src/Archetype"
import { World } from "../src/World"

describe("World", () => {
  describe("archetype", () => {
    it("creates an archetype for the given query", () => {
      const world = new World<{ name: string; age?: number }>()
      const archetype = world.archetype({ all: ["name"] })
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
})
