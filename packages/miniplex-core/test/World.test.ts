import { DerivableBucket } from "@miniplex/bucket/src"
import { Archetype, World } from "../src"
import { WithComponents } from "../src/types"

type Entity = {
  name: string
  age?: number
  height?: number
}

const hasAge = (v: any): v is WithComponents<Entity, "age"> =>
  typeof v.age !== "undefined"

describe(World, () => {
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

    it("adds the entity to relevant queries", () => {
      const world = new World<Entity>()
      const archetype = world.derive(hasAge)
      const john = world.add({ name: "John" })

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
      const archetype = world.derive(hasAge)
      expect(archetype.has(john)).toBe(true)

      world.removeComponent(john, "age")
      expect(archetype.has(john)).toBe(false)
    })

    it("only removes the component from the entity after the archetypes' onEntityRemoved events have fired", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 123 })
      const archetype = world.derive(hasAge)

      let age: number | undefined
      archetype.onEntityRemoved.add((entity) => {
        age = entity.age
      })

      world.removeComponent(john, "age")

      expect(john.age).toBe(undefined)
      expect(age).toBe(123)
    })
  })

  describe("query", () => {
    it("returns a query bucket that holds all entities matching a specific predicate", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 123 })

      const archetype = world.derive(hasAge)

      expect(archetype).toBeInstanceOf(DerivableBucket)
      expect(archetype.has(john)).toBe(true)
    })

    it("returns the same query bucket given the same predicate function", () => {
      const world = new World<Entity>()
      const archetype1 = world.derive(hasAge)
      const archetype2 = world.derive(hasAge)

      expect(archetype1).toBe(archetype2)
    })
  })
})
