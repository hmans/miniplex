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

    it("returns the same bucket for two predicates that are different objects, but the same implementation", () => {
      const world = new World<Entity>()

      const archetype = world.archetype(
        (v: any): v is WithComponents<Entity, "age"> =>
          typeof v.age !== "undefined"
      )

      expect(
        world.archetype(
          (v: any): v is WithComponents<Entity, "age"> =>
            typeof v.age !== "undefined"
        )
      ).toBe(archetype)
    })
  })

  describe("addComponent", () => {
    it("adds the component to the entity", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John" })

      world.addComponent(john, "age", 123)

      expect(john.age).toBe(123)
    })

    it("does nothing if the component already exists on the entity", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 123 })

      world.addComponent(john, "age", 456)

      expect(john.age).toBe(123)
    })

    it("adds the entity to relevant archetypes", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John" })
      const archetype = world.archetype(hasAge)

      world.addComponent(john, "age", 123)

      expect(archetype.has(john)).toBe(true)
    })
  })

  describe("removeComponent", () => {
    it("removes the component from the entity", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 123 })

      world.removeComponent(john, "age")

      expect(john.age).toBe(undefined)
    })

    it("does nothing if the component does not exist on the entity", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John" })

      world.removeComponent(john, "age")

      expect(john.age).toBe(undefined)
    })

    it("removes the entity from relevant archetypes", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 123 })
      const archetype = world.archetype(hasAge)
      expect(archetype.has(john)).toBe(true)

      world.removeComponent(john, "age")
      expect(archetype.has(john)).toBe(false)
    })

    it("only removes the component from the entity after the archetypes' onEntityRemoved events have fired", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 123 })
      const archetype = world.archetype(hasAge)

      let age: number | undefined
      archetype.onEntityRemoved.add((entity) => {
        age = entity.age
      })

      world.removeComponent(john, "age")

      expect(john.age).toBe(undefined)
      expect(age).toBe(123)
    })
  })
})
