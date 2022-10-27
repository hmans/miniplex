import { World } from "../src/World"

describe(World, () => {
  describe("addComponent", () => {
    it("adds a component to an entity", () => {
      const world = new World<{ name: string; age?: number }>()
      const entity = world.add({ name: "John" })
      world.addComponent(entity, "age", 42)
      expect(entity.name).toBe("John")
    })

    it("updates derived buckets", () => {
      const world = new World<{ name: string; age?: number }>()
      const entity = world.add({ name: "John" })
      const bucket = world.derive((entity) => Boolean(entity.age))
      world.addComponent(entity, "age", 42)
      expect(bucket.has(entity)).toBe(true)
    })
  })
})
