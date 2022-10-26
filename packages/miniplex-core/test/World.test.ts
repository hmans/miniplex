import { World } from "../src/World"

describe("World", () => {
  it("can be constructed with a list of entities", () => {
    const world = new World({ entities: [{ id: 1 }, { id: 2 }] })
    expect(world.entities).toHaveLength(2)
  })

  describe("add", () => {
    it("adds an entity to the world", () => {
      const world = new World()
      const entity = { id: 0 }

      world.add(entity)

      expect(world.entities).toEqual([entity])
    })
  })

  describe("remove", () => {
    it("removes an entity from the world", () => {
      const entity = { id: 0 }
      const world = new World({ entities: [entity] })
      expect(world.entities).toEqual([entity])

      world.remove(entity)
      expect(world.entities).toEqual([])
    })
  })
})
