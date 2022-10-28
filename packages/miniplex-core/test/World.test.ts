import { World } from "../src"
import { Predicate } from "../src/Predicate"
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
      const archetype = new Predicate(world, hasAge)
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
      const archetype = new Predicate(world, hasAge)
      expect(archetype.has(john)).toBe(true)

      world.removeComponent(john, "age")
      expect(archetype.has(john)).toBe(false)
    })

    it("only removes the component from the entity after the archetypes' onEntityRemoved events have fired", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 123 })
      const archetype = new Predicate(world, hasAge)

      let age: number | undefined
      archetype.onEntityRemoved.add((entity) => {
        age = entity.age
      })

      world.removeComponent(john, "age")

      expect(john.age).toBe(undefined)
      expect(age).toBe(123)
    })
  })

  describe("predicate", () => {
    it("returns a predicate that can be used to query the world", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 123 })

      const predicate = world.predicate(hasAge)

      expect(predicate).toBeInstanceOf(Predicate)
      expect(predicate.has(john)).toBe(true)
    })

    it("returns the same predicate instance given the same predicate function", () => {
      const world = new World<Entity>()
      const predicate1 = world.predicate(hasAge)
      const predicate2 = world.predicate(hasAge)

      expect(predicate1).toBe(predicate2)
    })
  })
})
