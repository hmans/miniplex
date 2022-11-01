import { World } from "../src"

type Entity = {
  name: string
  age?: number
  height?: number
}

describe(World, () => {
  describe("add", () => {
    it("adds an entity", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John" })
      expect(world.entities).toEqual([entity])
    })
  })

  describe("remove", () => {
    it("removes an entity", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John" })
      expect(world.entities).toEqual([entity])

      world.remove(entity)
      expect(world.entities).toEqual([])
    })
  })

  describe("id", () => {
    it("returns undefined for entities not in the world", () => {
      const world = new World<Entity>()
      const entity = { name: "John" }
      expect(world.id(entity)).toBeUndefined()
    })

    it("returns a unique ID for each entity", () => {
      const world = new World<Entity>()
      const entity1 = world.add({ name: "John" })
      const entity2 = world.add({ name: "Jane" })
      expect(world.id(entity1)).not.toBeUndefined()
      expect(world.id(entity2)).not.toBeUndefined()
      expect(world.id(entity1)).not.toEqual(world.id(entity2))
    })
  })

  describe("entity", () => {
    it("returns undefined for IDs not in the world", () => {
      const world = new World<Entity>()
      expect(world.entity(0)).toBeUndefined()
    })

    it("returns the entity for a given ID", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John" })
      const id = world.id(entity)!
      expect(world.entity(id)).toBe(entity)
    })
  })

  describe("addComponent", () => {
    it("adds a component to an entity", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John" })
      world.addComponent(entity, "age", 30)
      expect(entity).toEqual({ name: "John", age: 30 })
    })

    it("adds the entity to any relevant archetypes", () => {
      const world = new World<Entity>()
      const withAge = world.archetype({ with: ["age"] })
      const john = world.add({ name: "John" })
      const jane = world.add({ name: "Jane" })

      world.addComponent(john, "age", 30)
      expect(withAge.entities).toEqual([john])
    })
  })
})
