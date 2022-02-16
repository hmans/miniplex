import { createWorld, IEntity } from "../src/ecs"

/* hmecs supports entity type checking. \o/ */
type Entity = {
  name?: string
  age?: number
  admin?: boolean
} & IEntity

describe(createWorld, () => {
  describe("createArchetype", () => {
    it("for two equal archetypes, returns the same archetypes objects", () => {
      const world = createWorld<Entity>()
      const one = world.createArchetype({ all: ["name", "age"], none: ["admin"] })
      const two = world.createArchetype({ all: ["name", "age"], none: ["admin"] })
      const three = world.createArchetype(one)
      expect(one).toBe(two)
      expect(one).toBe(three)
    })

    it("it normalizes archetypes", () => {
      const world = createWorld<Entity>()
      const one = world.createArchetype({ all: ["name", "age"], none: ["admin"] })
      const two = world.createArchetype({ none: ["admin", undefined], all: ["age", "name"] })
      expect(one).toBe(two)
    })

    it("it accepts a list of component names", () => {
      const world = createWorld<Entity>()
      const archetype = world.createArchetype("name")
      expect(archetype).toEqual({ all: ["name"] })
    })
  })

  describe("addEntity", () => {
    it("accepts an object that will become the entity", () => {
      const ecs = createWorld<Entity>()
      const entity: Entity = { name: "Alice" }
      const returnedEntity = ecs.addEntity(entity)
      expect(returnedEntity).toBe(entity)
    })

    it("immediately adds the entity to the pool", () => {
      const ecs = createWorld<Entity>()
      expect(ecs.entities).toEqual([])
      const entity = ecs.addEntity({ name: "Alice" })
      expect(ecs.entities).toEqual([entity])
    })

    it("assigns an ID to the entity", () => {
      const ecs = createWorld<Entity>()
      const entity = ecs.addEntity({ name: "Alice" })
      expect(entity.id).toEqual(1)
    })

    it("assigns automatically incrementing IDs", () => {
      const ecs = createWorld<Entity>()
      ecs.addEntity({ name: "Alice" })
      const entity = ecs.addEntity({ name: "Bob" })
      expect(entity.id).toEqual(2)
    })

    describe(".queued", () => {
      it("queues an entity to be added to the entity pool", () => {
        const ecs = createWorld<Entity>()
        const entity = ecs.addEntity.queued({ name: "Alice" })

        expect(ecs.entities).not.toContain(entity)
        ecs.flushQueue()
        expect(ecs.entities).toContain(entity)
      })

      it("does not yet assign an ID", () => {
        const ecs = createWorld<Entity>()
        const entity = ecs.addEntity.queued({ name: "Alice" })
        expect(entity.id).toBeUndefined()

        /* Flushing won't change the ID */
        ecs.flushQueue()
        expect(entity.id).toEqual(1)
      })
    })
  })

  describe("archetypes", () => {
    const setup = () => {
      const ecs = createWorld<Entity>()
      const alice = ecs.addEntity({ name: "Alice", admin: true })
      const bob = ecs.addEntity({ name: "Bob" })

      return { ecs, alice, bob }
    }

    it("maintain indices of entities that have a specific set of components", () => {
      const { ecs, alice } = setup()
      const admins = ecs.createArchetype("admin")
      expect(ecs.get(admins)).toEqual([alice])
    })

    it("when a component is added to an entity, archetype indices are automatically updated", () => {
      const { ecs, alice, bob } = setup()
      const admins = ecs.createArchetype("admin")
      expect(ecs.get(admins)).toEqual([alice])
      ecs.addComponent(bob, "admin", true)
      expect(ecs.get(admins)).toEqual([alice, bob])
    })

    it("when a component is removed from an entity, archetype indices are automatically updated", () => {
      const { ecs, alice, bob } = setup()
      const withAdmin = ecs.createArchetype("admin")
      const withName = ecs.createArchetype("name")

      expect(ecs.get(withAdmin)).toEqual([alice])
      expect(ecs.get(withName)).toEqual([alice, bob])

      ecs.removeComponent(alice, "admin")

      expect(ecs.get(withAdmin)).toEqual([])
      expect(ecs.get(withName)).toEqual([alice, bob])
    })

    it("when an entity is removed, archetype indices are automatically updated", () => {
      const { ecs, alice, bob } = setup()
      const withAdmin = ecs.createArchetype("admin")
      const withName = ecs.createArchetype("name")

      expect(ecs.get(withAdmin)).toEqual([alice])
      expect(ecs.get(withName)).toEqual([alice, bob])

      ecs.removeEntity(alice)

      expect(ecs.get(withAdmin)).toEqual([])
      expect(ecs.get(withName)).toEqual([bob])
    })

    it("archetypes support 'all' to index entities that have all of the specified components", () => {
      const { ecs, alice, bob } = setup()
      const archetype = ecs.createArchetype({ all: ["name", "admin"] })
      expect(ecs.get(archetype)).toEqual([alice])
    })

    it("archetypes support 'any' to index entities that have one or more of the specified components", () => {
      const { ecs, alice, bob } = setup()
      const charlie = ecs.addEntity({ age: 123 })
      const archetype = ecs.createArchetype({ any: ["name", "age"] })
      expect(ecs.get(archetype)).toEqual([alice, bob, charlie])
    })

    it("archetypes support 'none' to index entities that have none of the specified components", () => {
      const { ecs, bob } = setup()
      const archetype = ecs.createArchetype({ none: ["admin"] })
      expect(ecs.get(archetype)).toEqual([bob])
    })

    it("all, any, none can be combined", () => {
      const { ecs, bob } = setup()
      const archetype = ecs.createArchetype({ all: ["name"], none: ["admin"] })
      expect(ecs.get(archetype)).toEqual([bob])
    })
  })
})
