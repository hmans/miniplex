import { World } from "../src"

type Entity = {
  name: string
  age?: number
  height?: number
}

describe(World, () => {
  it("can be instantiated with a list of entities", () => {
    const world = new World<Entity>([
      { name: "John", age: 30 },
      { name: "Jane", age: 28 }
    ])
    expect(world.entities).toHaveLength(2)
  })

  describe("add", () => {
    it("adds an entity", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John" })
      expect(world.entities).toEqual([entity])
    })
  })

  describe("remove", () => {
    it("removes an entity", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John" })
      expect(world.entities).toEqual([entity])

      world.remove(entity)
      expect(world.entities).toEqual([])
    })
  })

  describe("id", () => {
    it("returns undefined for entities not in the world", () => {
      const world = new World<Entity>()
      const entity = { name: "John" }
      expect(world.id(entity)).toBeUndefined()
    })

    it("returns a unique ID for each entity", () => {
      const world = new World<Entity>()
      const entity1 = world.add({ name: "John" })
      const entity2 = world.add({ name: "Jane" })
      expect(world.id(entity1)).not.toBeUndefined()
      expect(world.id(entity2)).not.toBeUndefined()
      expect(world.id(entity1)).not.toEqual(world.id(entity2))
    })
  })

  describe("entity", () => {
    it("returns undefined for IDs not in the world", () => {
      const world = new World<Entity>()
      expect(world.entity(0)).toBeUndefined()
    })

    it("returns the entity for a given ID", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John" })
      const id = world.id(entity)!
      expect(world.entity(id)).toBe(entity)
    })
  })

  describe("addComponent", () => {
    it("adds a component to an entity", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John" })
      world.addComponent(entity, "age", 30)
      expect(entity).toEqual({ name: "John", age: 30 })
    })

    it("adds the entity to any relevant archetypes", () => {
      const world = new World<Entity>()
      const withAge = world.with("age")
      const withoutAge = world.without("age")
      const john = world.add({ name: "John" })
      const jane = world.add({ name: "Jane" })

      world.addComponent(john, "age", 30)
      expect(withAge.entities).toEqual([john])
      expect(withoutAge.entities).toEqual([jane])
    })

    it("adds the entity to nested archetypes", () => {
      const world = new World<Entity>()
      const withAge = world.with("name").with("age")

      const john = world.add({ name: "John" })
      expect(withAge.entities).toEqual([])

      world.addComponent(john, "age", 30)
      expect(withAge.entities).toEqual([john])
    })

    it("can add a component to multiple entities at once", () => {
      const world = new World<Entity>()
      const withAge = world.with("age")
      const john = world.add({ name: "John" })
      const jane = world.add({ name: "Jane" })

      world.addComponent([john, jane], "age", 30)
      expect(withAge.entities).toEqual([john, jane])
    })
  })

  describe("removeComponent", () => {
    it("removes a component from an entity", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John", age: 30 })
      world.removeComponent(entity, "age")
      expect(entity).toEqual({ name: "John" })
    })

    it("removes the entity from any relevant archetypes", () => {
      const world = new World<Entity>()
      const withAge = world.archetype({ with: ["age"] })
      const john = world.add({ name: "John", age: 30 })
      const jane = world.add({ name: "Jane", age: 35 })
      expect(withAge.entities).toEqual([john, jane])

      world.removeComponent(john, "age")
      expect(withAge.entities).toEqual([jane])
    })

    it("removes the entity from nested archetypes", () => {
      const world = new World<Entity>()
      const withAge = world.with("name").with("age")

      const john = world.add({ name: "John", age: 30 })
      expect(withAge.entities).toEqual([john])

      world.removeComponent(john, "age")
      expect(withAge.entities).toEqual([])
    })

    it("uses a future check, so in onEntityRemoved, the entity is still intact", () => {
      const world = new World<Entity>()
      const withAge = world.with("age")
      const john = world.add({ name: "John", age: 30 })

      let age: number | undefined
      withAge.onEntityRemoved.add((entity) => {
        age = entity.age
      })

      world.removeComponent(john, "age")

      expect(age).toBe(30)
    })
  })
})
