import { World } from "../src"
import { WithComponents } from "../src/types"

type Entity = {
  name: string
  age?: number
  height?: number
}

const hasAge = (v: any): v is WithComponents<Entity, "age"> =>
  typeof v.age !== "undefined"

describe(World, () => {
  describe("derive", () => {
    it("given a predicate, returns a new bucket containing all entities matching the predicate", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 123 })
      const alice = world.add({ name: "Alice" })

      const archetype = world.archetype(hasAge)

      expect(archetype.has(john)).toBe(true)
      expect(archetype.has(alice)).toBe(false)
    })

    it("returns the same bucket instance for the same predicate", () => {
      const world = new World<Entity>()
      const archetype = world.archetype(hasAge)

      expect(world.archetype(hasAge)).toBe(archetype)
    })
  })
})
