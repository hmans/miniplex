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
})
