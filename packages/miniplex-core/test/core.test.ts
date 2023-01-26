import { Monitor, Query, World } from "../src/core"

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

  describe("update", () => {
    it("updates the entity", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John" })
      expect(entity.name).toEqual("John")

      world.update(entity, { name: "Jane" })
      expect(entity.name).toEqual("Jane")
    })

    it("triggers a reindexing of the entity", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John" })
      expect(entity.name).toEqual("John")

      const hasAge = world.with("age")
      expect(hasAge.entities).toEqual([])

      world.update(entity, { age: 28 })
      expect(hasAge.entities).toEqual([entity])
    })

    it("returns the entity", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John" })
      expect(world.update(entity, { name: "Jane" })).toEqual(entity)
    })

    it("accepts a function that returns an object containing changes", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John" })
      expect(entity.name).toEqual("John")

      world.update(entity, () => ({ name: "Jane" }))
      expect(entity.name).toEqual("Jane")
    })

    it("accepts a function that mutates the entity directly", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John" })
      expect(entity.name).toEqual("John")

      world.update(entity, (entity) => {
        entity.name = "Jane"
      })

      expect(entity.name).toEqual("Jane")
    })

    it("accepts a component name and value", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John" })
      expect(entity.name).toEqual("John")

      world.update(entity, "name", "Jane")
      expect(entity.name).toEqual("Jane")
    })

    it("can be called without a second argument to trigger the reindexing only", () => {
      const world = new World<Entity>()
      const entity = world.add({ name: "John" })
      expect(entity.name).toEqual("John")

      const hasAge = world.with("age")
      expect(hasAge.entities).toEqual([])

      entity.age = 45
      world.update(entity)
      expect(hasAge.entities).toEqual([entity])
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
        without: ["height"],
        predicates: []
      })

      expect(query).toBeInstanceOf(Query)
      expect(query.config).toEqual({
        with: ["age"],
        without: ["height"],
        predicates: []
      })
    })

    it("normalizes the incoming query configuration", () => {
      const world = new World<Entity>()

      const query = world.query({
        with: ["age", "age"],
        without: ["height", "height", "dead"],
        predicates: []
      })

      expect(query.config).toEqual({
        with: ["age"],
        without: ["dead", "height"],
        predicates: []
      })
    })

    it("reuses existing connected queries if they have the same configuration", () => {
      const world = new World<Entity>()

      const query1 = world.query({
        with: ["age"],
        without: ["height"],
        predicates: []
      })

      const query2 = world.query({
        with: ["age"],
        without: ["height"],
        predicates: []
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

      expect(withAge.isConnected).toBe(false)
      expect(withoutHeight.isConnected).toBe(true)
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
      expect(withAge.isConnected).toBe(false)

      withAge.connect()
      expect(withAge.isConnected).toBe(true)
    })

    it("automatically connects the query the first time its entities are accessed", () => {
      const world = new World<Entity>()
      const withAge = world.with("age")
      expect(withAge.isConnected).toBe(false)

      withAge.entities
      expect(withAge.isConnected).toBe(true)
    })

    it("automatically connects the query the first time it is iterated over", () => {
      const world = new World<Entity>()
      world.add({ name: "John", age: 30 })

      const withAge = world.with("age")
      expect(withAge.isConnected).toBe(false)

      for (const entity of withAge) {
        expect(entity).toBeDefined()
      }

      expect(withAge.isConnected).toBe(true)
    })

    it("automatically connects the query when something subscribes to onEntityAdded", () => {
      const world = new World<Entity>()
      const withAge = world.with("age")
      expect(withAge.isConnected).toBe(false)

      withAge.onEntityAdded.subscribe(() => {})
      expect(withAge.isConnected).toBe(true)
    })

    it("automatically connects the query when something subscribes to onEntityRemoves", () => {
      const world = new World<Entity>()
      const withAge = world.with("age")
      expect(withAge.isConnected).toBe(false)

      withAge.onEntityRemoved.subscribe(() => {})
      expect(withAge.isConnected).toBe(true)
    })
  })

  describe("where", () => {
    it("returns a query that applies the given predicate", () => {
      const world = new World<Entity>()

      const john = world.add({ name: "John", age: 40 })
      const jane = world.add({ name: "Jane", age: 25 })
      const paul = world.add({ name: "Paul", age: 32 })

      const over30 = world.with("age").where(({ age }) => age > 30)
      expect(over30.entities).toEqual([paul, john])

      const startsWithJ = over30.where(({ name }) => name.startsWith("J"))
      expect(startsWithJ.entities).toEqual([john])
    })

    it("supports type narrowing", () => {
      type NamedPerson = { name: string }

      function isNamedPerson(entity: Entity): entity is NamedPerson {
        return "name" in entity
      }

      const world = new World<Entity>()
      const named = world.where(isNamedPerson)
    })

    it("returns the same query for the same predicate", () => {
      const world = new World<Entity>()
      const john = world.add({ name: "John", age: 40 })
      const jane = world.add({ name: "Jane", age: 25 })
      const paul = world.add({ name: "Paul", age: 32 })

      const isOver30 = ({ age }: { age: number }) => age > 30

      const over30s = world.with("age").where(isOver30)

      expect(over30s).toBe(world.with("age").where(isOver30))
      expect(over30s.entities).toEqual([paul, john])

      const isOver35 = ({ age }: { age: number }) => age > 35

      const over35s = over30s.where(isOver35)

      expect(over35s).not.toBe(over30s)
      expect(over35s.entities).toEqual([john])
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

describe(Monitor, () => {
  it("executes the setup callback on all entities in a query, and all future entities added to it", () => {
    /* Create a world with an entity */
    const world = new World<Entity>()
    const john = world.add({ name: "John", age: 30 })

    /* Create a query */
    const query = world.with("age")

    /* Create a monitor */
    const setup = jest.fn()
    const teardown = jest.fn()
    const monitor = query.monitor(setup, teardown)

    /* The setup callback should be called with the existing entity */
    monitor.run()
    expect(setup).toHaveBeenCalledWith(john)

    /* Add another entity. The setup callback should be called with it */
    const jane = world.add({ name: "Jane", age: 25 })
    monitor.run()
    expect(setup).toHaveBeenCalledWith(jane)

    /* Remove all entities. The teardown callback should be called with both entities */
    world.clear()
    monitor.run()
    expect(teardown).toHaveBeenCalledWith(john)
    expect(teardown).toHaveBeenCalledWith(jane)
  })

  describe("connect", () => {
    it("returns the monitor instance", () => {
      const world = new World<Entity>()
      const monitor = world.with("age").monitor()
      expect(monitor.connect()).toBe(monitor)
    })
  })

  describe("disconnect", () => {
    it("returns the monitor instance", () => {
      const world = new World<Entity>()
      const monitor = world.with("age").monitor()
      expect(monitor.disconnect()).toBe(monitor)
    })
  })
})
