import { Archetype } from "../src/Archetype"
import { World } from "../src/World"

describe("World", () => {
  describe("archetype", () => {
    it("creates an archetype", () => {
      const world = new World<{ name: string; age?: number }>()
      const archetype = world.archetype({ all: ["name"] })
      expect(archetype).toBeDefined()
      expect(archetype).toBeInstanceOf(Archetype)
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
})
