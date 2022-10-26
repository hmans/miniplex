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
})
