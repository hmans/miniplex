import { World, Query } from "../src"

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

  describe("produceQuery", () => {
    it("returns a query for the given configuration", () => {
      const world = new World<Entity>()

      const query = world.query({
        with: ["age"],
        without: ["height"]
      })

      expect(query).toBeInstanceOf(Query)
      expect(query.config).toEqual({
        with: ["age"],
        without: ["height"]
      })
    })

    it("normalizes the incoming query configuration", () => {
      const world = new World<Entity>()

      const query = world.query({
        with: ["age", "age"],
        without: ["height", "height", "dead"]
      })

      expect(query.config).toEqual({
        with: ["age"],
        without: ["dead", "height"]
      })
    })

    it("reuses existing connected queries if they have the same configuration", () => {
      const world = new World<Entity>()

      const query1 = world.query({
        with: ["age"],
        without: ["height"]
      })

      const query2 = world.query({
        with: ["age"],
        without: ["height"]
      })

      expect(query1).toBe(query2)
    })
  })

  describe("with and without", () => {
    it("returns a new query instance", () => {
      const world = new World<Entity>()
      const withAge = world.with("age")
      expect(withAge).toBeInstanceOf(Query)
    })

    it("reuses existing query instances", () => {
      const world = new World<Entity>()
      const withAge = world.with("age")

      const withAge2 = world.with("age")
      expect(withAge).toBe(withAge2)
    })

    it("can be chained", () => {
      const world = new World<Entity>()
      const withAge = world.with("age")
      const withoutHeight = withAge.without("height")

      expect(withAge).toBeInstanceOf(Query)
      expect(withoutHeight).toBeInstanceOf(Query)

      for (const _ of withoutHeight) {
        /* no-op */
      }

      expect(world.isQueryConnected(withAge)).toBe(false)
      expect(world.isQueryConnected(withoutHeight)).toBe(true)
    })

    it("when chained, also reuses matching query instances", () => {
      const world = new World<Entity>()
      const queryA = world.with("age").without("height")
      const queryB = world.without("height").with("age")

      expect(queryA).toBe(queryB)
    })

    it("does not automatically connect the new query instance", () => {
      const world = new World<Entity>()
      const withAge = world.with("age")
      expect(world.isQueryConnected(withAge)).toBe(false)

      withAge.connect()
      expect(world.isQueryConnected(withAge)).toBe(true)
    })

    it("automatically connects the query the first time its entities are accessed", () => {
      const world = new World<Entity>()
      const withAge = world.with("age")
      expect(world.isQueryConnected(withAge)).toBe(false)

      withAge.entities
      expect(world.isQueryConnected(withAge)).toBe(true)
    })

    it("automatically connects the query the first time it is iterated over", () => {
      const world = new World<Entity>()
      world.add({ name: "John", age: 30 })

      const withAge = world.with("age")
      expect(world.isQueryConnected(withAge)).toBe(false)

      for (const entity of withAge) {
        expect(entity).toBeDefined()
      }

      expect(world.isQueryConnected(withAge)).toBe(true)
    })

    it("automatically connects the query when something subscribes to onEntityAdded", () => {
      const world = new World<Entity>()
      const withAge = world.with("age")
      expect(world.isQueryConnected(withAge)).toBe(false)

      withAge.onEntityAdded.subscribe(() => {})
      expect(world.isQueryConnected(withAge)).toBe(true)
    })

    it("automatically connects the query when something subscribes to onEntityRemoves", () => {
      const world = new World<Entity>()
      const withAge = world.with("age")
      expect(world.isQueryConnected(withAge)).toBe(false)

      withAge.onEntityRemoved.subscribe(() => {})
      expect(world.isQueryConnected(withAge)).toBe(true)
    })
  })

  describe("addComponent", () => {
    it("adds a component to an entity", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John" })
      world.addComponent(entity, "age", 30)
      expect(entity).toEqual({ name: "John", age: 30 })
    })

    it("adds the entity to any relevant queries", () => {
      const world = new World<Entity>()
      const query = world.with("age").without("height")
      const entity = world.add({ name: "John" })
      world.addComponent(entity, "age", 30)
      expect(query.entities).toEqual([entity])
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
      const query = world.with("age").without("height")
      const entity = world.add({ name: "John", age: 30 })
      expect(query.entities).toEqual([entity])

      world.removeComponent(entity, "age")
      expect(query.entities).toEqual([])
    })

    it("uses a future check, so in onEntityRemoved, the entity is still intact", () => {
      const world = new World<Entity>()
      const query = world.with("age").without("height")
      const entity = world.add({ name: "John", age: 30 })
      expect(query.entities).toEqual([entity])

      query.onEntityRemoved.subscribe((removedEntity) => {
        expect(removedEntity).toEqual(entity)
        expect(removedEntity.age).toEqual(30)
      })

      world.removeComponent(entity, "age")
      expect(query.entities).toEqual([])
    })
  })
})
