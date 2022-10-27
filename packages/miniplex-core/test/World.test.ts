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

  describe("removeComponent", () => {
    it("removes the component from the entity", () => {
      const world = new World<{ name: string; age?: number }>()
      const entity = world.add({ name: "John", age: 42 })
      world.removeComponent(entity, "age")
      expect(entity.age).toBeUndefined()
    })

    it("updates derived buckets", () => {
      const world = new World<{ name: string; age?: number }>()
      const entity = world.add({ name: "John", age: 42 })
      const bucket = world.derive((entity) => Boolean(entity.age))
      expect(bucket.has(entity)).toBe(true)

      world.removeComponent(entity, "age")
      expect(bucket.has(entity)).toBe(false)
    })

    it("only actually removes the component after removing the entity from all derived buckets", () => {
      const world = new World<{ name: string; age?: number }>()
      const entity = world.add({ name: "John", age: 42 })

      /* Create a bucket */
      const bucket = world.derive((entity) => Boolean(entity.age))

      /* Capture the age component before it is being removed */
      let age: number | undefined
      bucket.onEntityRemoved.add((e) => {
        age = e.age
      })

      world.removeComponent(entity, "age")
      expect(age).toBe(42)
    })
  })
})
