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
  })

  describe("remove", () => {
    it("removes an entity from the world", () => {
      const entity = { id: 0 }
      const world = new Bucket({ entities: [entity] })
      expect(world.entities).toEqual([entity])

      world.remove(entity)
      expect(world.entities).toEqual([])
    })
  })
})
