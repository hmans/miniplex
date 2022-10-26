import { Bucket } from "../src/Bucket"

describe("Bucket", () => {
  it("can be constructed with a list of entities", () => {
    const world = new Bucket({ entities: [{ id: 1 }, { id: 2 }] })
    expect(world.entities).toHaveLength(2)
  })

  describe("add", () => {
    it("adds an entity to the world", () => {
      const world = new Bucket()
      const entity = { id: 0 }

      world.add(entity)

      expect(world.entities).toEqual([entity])
    })

    it("doesn't add the same entity twice", () => {
      const world = new Bucket()
      const entity = { id: 0 }

      world.add(entity)
      world.add(entity)

      expect(world.entities).toEqual([entity])
    })

    it("returns the entity", () => {
      const world = new Bucket()
      const entity = { id: 0 }

      const result = world.add(entity)

      expect(result).toBe(entity)
    })
  })

  describe("remove", () => {
    it("removes an entity from the world", () => {
      const entity = { id: 0 }
      const world = new Bucket({ entities: [entity] })
      expect(world.entities).toEqual([entity])

      world.remove(entity)
      expect(world.entities).toEqual([])
    })

    it("no-ops if it doesn't have the entity", () => {
      const world = new Bucket()
      expect(world.entities).toEqual([])

      world.remove({ id: 0 })
      expect(world.entities).toEqual([])
    })
  })
})
