import { World, IEntity } from "../src/World"

/* hmecs supports entity type checking. \o/ */
type Entity = {
  name?: string
  age?: number
  admin?: boolean
} & IEntity

describe("World", () => {
  it("can be instantiated as a class", () => {
    const world = new World<Entity>()
    expect(world).toBeInstanceOf(World)
  })

  describe("addEntity", () => {
    it("accepts an object that will become the entity", () => {
      const world = new World<Entity>()
      const entity: Entity = { name: "Alice" }
      const returnedEntity = world.addEntity(entity)
      expect(returnedEntity).toBe(entity)
    })

    it("immediately adds the entity to the pool", () => {
      const world = new World<Entity>()
      expect(world.entities).toEqual([])
      const entity = world.addEntity({ name: "Alice" })
      expect(world.entities).toEqual([entity])
    })

    it("assigns an ID to the entity", () => {
      const world = new World<Entity>()
      const entity = world.addEntity({ name: "Alice" })
      expect(entity.id).toEqual(1)
    })

    it("assigns automatically incrementing IDs", () => {
      const world = new World<Entity>()
      world.addEntity({ name: "Alice" })
      const entity = world.addEntity({ name: "Bob" })
      expect(entity.id).toEqual(2)
    })

    describe(".queued", () => {
      it("queues an entity to be added to the entity pool", () => {
        const world = new World<Entity>()
        const entity = world.queue.addEntity({ name: "Alice" })

        expect(world.entities).not.toContain(entity)
        world.queue.flush()
        expect(world.entities).toContain(entity)
      })

      it("does not yet assign an ID", () => {
        const world = new World<Entity>()
        const entity = world.queue.addEntity({ name: "Alice" })
        expect(entity.id).toBeUndefined()

        /* Flushing won't change the ID */
        world.queue.flush()
        expect(entity.id).toEqual(1)
      })
    })
  })

  describe("createArchetype", () => {
    it("for two equal archetypes, returns the same archetypes objects", () => {
      const world = new World<Entity>()
      const one = world.createArchetype({ all: ["name", "age"], none: ["admin"] })
      const two = world.createArchetype({ all: ["name", "age"], none: ["admin"] })
      expect(one).toBe(two)
    })

    it("it normalizes archetypes", () => {
      const world = new World<Entity>()
      const one = world.createArchetype({ all: ["name", "age"], none: ["admin"] })
      const two = world.createArchetype({ none: ["admin", undefined], all: ["age", "name"] })
      expect(one).toBe(two)
    })

    it("it accepts a list of component names", () => {
      const world = new World<Entity>()
      const archetype = world.createArchetype("name")
      expect(archetype.query).toEqual({ all: ["name"] })
    })
  })

  describe("archetypes", () => {
    const setup = () => {
      const world = new World<Entity>()
      const alice = world.addEntity({ name: "Alice", admin: true })
      const bob = world.addEntity({ name: "Bob" })

      return { world, alice, bob }
    }

    it("maintain indices of entities that have a specific set of components", () => {
      const { world, alice } = setup()
      const admins = world.createArchetype("admin")
      expect(admins.entities).toEqual([alice])
    })

    it("when a component is added to an entity, archetype indices are automatically updated", () => {
      const { world: ecs, alice, bob } = setup()
      const admins = ecs.createArchetype("admin")
      expect(admins.entities).toEqual([alice])
      ecs.addComponent(bob, "admin", true)
      expect(admins.entities).toEqual([alice, bob])
    })

    it("when a component is removed from an entity, archetype indices are automatically updated", () => {
      const { world: ecs, alice, bob } = setup()
      const withAdmin = ecs.createArchetype("admin")
      const withName = ecs.createArchetype("name")

      expect(withAdmin.entities).toEqual([alice])
      expect(withName.entities).toEqual([alice, bob])

      ecs.removeComponent(alice, "admin")

      expect(withAdmin.entities).toEqual([])
      expect(withName.entities).toEqual([alice, bob])
    })

    it("when an entity is removed, archetype indices are automatically updated", () => {
      const { world, alice, bob } = setup()
      const withAdmin = world.createArchetype({ all: ["admin"] })
      const withName = world.createArchetype({ all: ["name"] })

      expect(withAdmin.entities).toEqual([alice])
      expect(withName.entities).toEqual([alice, bob])

      world.removeEntity(alice)

      expect(withAdmin.entities).toEqual([])
      expect(withName.entities).toEqual([bob])
    })

    it("archetypes support 'all' to index entities that have all of the specified components", () => {
      const { world, alice, bob } = setup()
      const archetype = world.createArchetype({ all: ["name", "admin"] })
      expect(archetype.entities).toEqual([alice])
    })

    it("archetypes support 'any' to index entities that have one or more of the specified components", () => {
      const { world, alice, bob } = setup()
      const charlie = world.addEntity({ age: 123 })
      const archetype = world.createArchetype({ any: ["name", "age"] })
      expect(archetype.entities).toEqual([alice, bob, charlie])
    })

    it("archetypes support 'none' to index entities that have none of the specified components", () => {
      const { world, bob } = setup()
      const archetype = world.createArchetype({ none: ["admin"] })
      expect(archetype.entities).toEqual([bob])
    })

    it("all, any, none can be combined", () => {
      const { world, bob } = setup()
      const archetype = world.createArchetype({ all: ["name"], none: ["admin"] })
      expect(archetype.entities).toEqual([bob])
    })
  })
})
