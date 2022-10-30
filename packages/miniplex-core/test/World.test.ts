import { Bucket } from "@miniplex/bucket"
import { archetype, World } from "../src"
import { WithComponents } from "../src/types"

type Entity = {
  name: string
  age?: number
  height?: number
}

const hasAge = (v: any): v is WithComponents<Entity, "age"> =>
  typeof v.age !== "undefined"

describe(World, () => {
  it("can be instantiated with a list of entities", () => {
    const world = new World<Entity>([
      { name: "Alice", age: 25 },
      { name: "Bob", age: 30 }
    ])

    expect(world.size).toBe(2)
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

    it("adds the entity to relevant queries", () => {
      const world = new World<Entity>()
      const archetype = world.where(hasAge)
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
      const archetype = world.where(hasAge)
      expect(archetype.has(john)).toBe(true)

      world.removeComponent(john, "age")
      expect(archetype.has(john)).toBe(false)
    })

    it("only removes the component from the entity after the archetypes' onEntityRemoved events have fired", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 123 })
      const withAge = world.where(hasAge)

      let age: number | undefined
      withAge.onEntityRemoved.add((entity) => {
        age = entity.age
      })

      world.removeComponent(john, "age")

      expect(john.age).toBe(undefined)
      expect(age).toBe(123)
    })

    it("only removes the component from the entity after the archetypes' onEntityRemoved events have fired, even with nested buckets", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 123 })
      const withName = world.where(archetype("name"))
      const withAge = withName.where(archetype("age"))
      const reallyOld = withAge.where((entity) => entity.age > 100)

      let age: number | undefined
      reallyOld.onEntityRemoved.add((entity) => {
        age = entity.age
      })

      world.removeComponent(john, "age")

      expect(john.age).toBe(undefined)
      expect(age).toBe(123)
    })
  })

  describe("where", () => {
    it("returns a query bucket that holds all entities matching a specific predicate", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 123 })

      const archetype = world.where(hasAge)

      expect(archetype).toBeInstanceOf(Bucket)
      expect(archetype.has(john)).toBe(true)
    })

    it("returns the same query bucket given the same predicate function", () => {
      const world = new World<Entity>()
      const archetype1 = world.where(hasAge)
      const archetype2 = world.where(hasAge)

      expect(archetype1).toBe(archetype2)
    })

    it("can derive a bucket holding all entities with specific components", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 123 })

      const bucket = world.where(archetype("age"))

      expect(bucket.has(john)).toBe(true)
    })

    it("can be nested, creating a graph of buckets", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 123, height: 180 })
      const jane = world.add({ name: "Jane", age: 123 })

      const withAge = world.where(archetype("age"))
      const withAgeAndHeight = withAge.where(archetype("height"))

      expect(withAge.entities).toEqual([john, jane])
      expect(withAgeAndHeight.entities).toEqual([john])
    })

    it("can use the archetype predicate helper", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 123, height: 180 })
      const jane = world.add({ name: "Jane" })

      const withAge = world.where(archetype({ with: ["age"] }))

      expect(withAge.entities).toEqual([john])
    })

    it("can use the archetype predicate helper with its short form", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 123, height: 180 })
      const jane = world.add({ name: "Jane" })

      const withAge = world.where(archetype("age"))

      expect(withAge.entities).toEqual([john])
    })
  })

  describe("archetype", () => {
    it("is shorthand for .where(archetype(...components))", () => {
      const world = new World<Entity>()
      const bucket1 = world.where(archetype("name", "age"))
      const bucket2 = world.archetype("name", "age")
      expect(bucket1).toBe(bucket2)
    })

    it("is shorthand for .where(archetype(query))", () => {
      const world = new World<Entity>()
      const bucket1 = world.where(archetype({ with: ["name", "age"] }))
      const bucket2 = world.archetype({ with: ["name", "age"] })
      expect(bucket1).toBe(bucket2)
    })
  })

  describe("id", () => {
    it("returns the id of the entity", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John" })

      expect(world.id(john)).toBe(0)
    })

    it("returns undefined if the entity is not in the world", () => {
      const world = new World<Entity>()
      const john = { name: "John" }

      expect(world.id(john)).toBe(undefined)
    })
  })

  describe("entity", () => {
    it("returns the entity with the given id", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John" })
      const id = world.id(john)!

      expect(world.entity(id)).toBe(john)
    })

    it("returns undefined if the id is not in the world", () => {
      const world = new World<Entity>()

      expect(world.entity(0)).toBe(undefined)
    })
  })
})
