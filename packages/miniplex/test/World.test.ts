import { World } from "../src/World"

describe("World", () => {
  describe("add", () => {
    it("adds an entity to the world", () => {
      const world = new World()
      const entity = { id: 1 }
      world.add(entity)
      expect(world.entities).toEqual([entity])
    })
  })

  describe("remove", () => {
    it("removes an entity from the world", () => {
      const world = new World()
      const entity = { id: 1 }
      world.add(entity)
      expect(world.entities).toEqual([entity])
      world.remove(entity)
      expect(world.entities).toEqual([])
    })
  })

  describe("touch", () => {
    it("emits an event", () => {
      const world = new World()
      const entity = { id: 1 }
      world.add(entity)

      const spy = jest.fn()
      world.onEntityUpdated.addListener(spy)
      world.touch(entity)

      expect(spy).toHaveBeenCalledWith(entity)
    })
  })
})
