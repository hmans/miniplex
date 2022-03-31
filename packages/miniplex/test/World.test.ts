import { World, IEntity } from "../src/World"

/* hmecs supports entity type checking. \o/ */
type Entity = {
  name?: string
  age?: number
  admin?: boolean
}

type Vector2 = {
  x: number
  y: number
}

type GameObject = {
  position: Vector2
  velocity?: Vector2
  health?: { max: number; current: number }
} & IEntity

describe("World", () => {
  it("can be instantiated as a class", () => {
    const world = new World<Entity>()
    expect(world).toBeInstanceOf(World)
  })

  describe("createEntity", () => {
    it("creates a new entity", () => {
      const world = new World<Entity>()
      const entity = world.createEntity()
      expect(entity.id).not.toBeUndefined()
    })

    it("accepts an object that will become the entity", () => {
      const world = new World<Entity>()
      const entity: Partial<Entity> = { name: "Alice" }
      const returnedEntity = world.createEntity(entity)
      expect(returnedEntity).toBe(entity)
    })

    it("immediately adds the entity to the pool", () => {
      const world = new World<Entity>()
      expect(world.entities).toEqual([])
      const entity = world.createEntity({ name: "Alice" })
      expect(world.entities).toEqual([entity])
    })

    it("assigns an ID to the entity", () => {
      const world = new World<Entity>()
      const entity = world.createEntity({ name: "Alice" })
      expect(entity.id).toEqual(1)
    })

    it("assigns automatically incrementing IDs", () => {
      const world = new World<Entity>()
      world.createEntity({ name: "Alice" })
      const entity = world.createEntity({ name: "Bob" })
      expect(entity.id).toEqual(2)
    })

    describe(".queued", () => {
      it("queues an entity to be added to the entity pool", () => {
        const world = new World<Entity>()
        const entity = world.queue.createEntity({ name: "Alice" })

        expect(world.entities).not.toContain(entity)
        world.queue.flush()
        expect(world.entities).toContain(entity)
      })

      it("does not yet assign an ID", () => {
        const world = new World<Entity>()
        const entity = world.queue.createEntity({ name: "Alice" })
        expect(entity.id).toBeUndefined()

        /* Flushing won't change the ID */
        world.queue.flush()
        expect(entity.id).toEqual(1)
      })
    })
  })

  describe("destroyEntity", () => {
    it("removes an entity from the world", () => {
      const world = new World<GameObject>()
      const entity = world.createEntity({ position: { x: 0, y: 0 } })

      expect(world.entities).toContain(entity)
      world.destroyEntity(entity)
      expect(world.entities).not.toContain(entity)
    })

    it("no-ops when trying to remove an entity that is not managed by this world", () => {
      const world = new World<GameObject>()
      const otherWorld = new World<GameObject>()
      const entity = otherWorld.createEntity({ position: { x: 0, y: 0 } })

      expect(world.entities).not.toContain(entity)
      expect(() => {
        world.destroyEntity(entity)
      }).not.toThrow()
      expect(world.entities).not.toContain(entity)
    })

    it("removes the entity from all archetypes", () => {
      const world = new World<GameObject>()
      const withVelocity = world.archetype("velocity")
      const entity = world.createEntity({
        position: { x: 0, y: 0 },
        velocity: { x: 1, y: 2 }
      })

      expect(withVelocity.entities).toContain(entity)
      world.destroyEntity(entity)
      expect(withVelocity.entities).not.toContain(entity)
    })
  })

  describe("addComponent", () => {
    const position = (x: number = 0, y: number = 0) => ({ position: { x, y } })
    const velocity = (x: number = 0, y: number = 0) => ({ velocity: { x, y } })
    const health = (amount: number) => ({
      health: { max: amount, current: amount }
    })

    it("adds a component expressed as a partial entity", () => {
      const world = new World<GameObject>()
      const entity = world.createEntity()

      world.addComponent(entity, position(1, 2))

      expect(entity.position).toEqual({ x: 1, y: 2 })
    })

    it("adds multiple components expressed within the same partial entity", () => {
      const world = new World<GameObject>()
      const entity = world.createEntity()

      world.addComponent(entity, { ...position(1, 2), ...health(100) })

      expect(entity).toEqual({
        id: 1,
        position: { x: 1, y: 2 },
        health: { max: 100, current: 100 }
      })
    })

    it("adds multiple components expressed as multiple partial entitie", () => {
      const world = new World<GameObject>()
      const entity = world.createEntity()

      world.addComponent(entity, position(1, 2), health(100))

      expect(entity).toEqual({
        id: 1,
        position: { x: 1, y: 2 },
        health: { max: 100, current: 100 }
      })
    })

    it("adds entities to relevant archetypes", () => {
      const world = new World<GameObject>()
      const withVelocity = world.archetype("velocity")

      const entity = world.createEntity({ ...position() })
      expect(withVelocity.entities).not.toContain(entity)

      world.addComponent(entity, velocity())
      expect(withVelocity.entities).toContain(entity)
    })

    it("throws when the specified entity is not managed by this world", () => {
      const world = new World<GameObject>()
      const otherWorld = new World<GameObject>()
      const entity = otherWorld.createEntity({ position: { x: 0, y: 0 } })

      expect(() => {
        world.addComponent(entity, velocity())
      }).toThrow()
    })

    it("throws when the component already exists on the entity", () => {
      const world = new World<GameObject>()
      const entity = world.createEntity(position())

      expect(() => {
        world.addComponent(entity, position())
      }).toThrow()
    })
  })

  describe("removeComponent", () => {
    it("removes a component from an entity", () => {
      const world = new World<GameObject>()
      const entity = world.createEntity({
        position: { x: 0, y: 0 },
        velocity: { x: 1, y: 2 }
      })
      world.removeComponent(entity, "velocity")
      expect(entity.velocity).toBeUndefined()
    })

    it("removes entities from relevant archetypes", () => {
      const world = new World<GameObject>()
      const withVelocity = world.archetype("velocity")
      const entity = world.createEntity({
        position: { x: 0, y: 0 },
        velocity: { x: 1, y: 2 }
      })
      expect(withVelocity.entities).toContain(entity)
      world.removeComponent(entity, "velocity")
      expect(withVelocity.entities).not.toContain(entity)
    })

    it("throws when the specified component is not present on the entity", () => {
      const world = new World<GameObject>()
      const entity = world.createEntity({ position: { x: 0, y: 0 } })
      expect(() => {
        world.removeComponent(entity, "velocity")
      }).toThrow()
    })

    it("throws when the specified entity is not managed by this world", () => {
      const world = new World<GameObject>()
      const otherWorld = new World<GameObject>()
      const entity = otherWorld.createEntity({
        position: { x: 0, y: 0 },
        velocity: { x: 1, y: 2 }
      })
      expect(() => {
        world.removeComponent(entity, "velocity")
      }).toThrow()
    })
  })

  describe("archetype", () => {
    it("for two equal archetypes, returns the same archetypes objects", () => {
      const world = new World<Entity>()
      const one = world.archetype("name", "age")
      const two = world.archetype("name", "age")
      expect(one).toBe(two)
    })

    it("it normalizes archetypes", () => {
      const world = new World<Entity>()
      const one = world.archetype("name", "age")
      const two = world.archetype("age", "name")
      expect(one).toBe(two)
    })

    it("it accepts a list of component names", () => {
      const world = new World<Entity>()
      const archetype = world.archetype("name")
      expect(archetype.query).toEqual(["name"])
    })
  })

  describe("archetype", () => {
    const setup = () => {
      const world = new World<Entity>()
      const alice = world.createEntity({ name: "Alice", admin: true })
      const bob = world.createEntity({ name: "Bob" })

      return { world, alice, bob }
    }

    it("maintain indices of entities that have a specific set of components", () => {
      const { world, alice } = setup()
      const admins = world.archetype("admin")
      expect(admins.entities).toEqual([alice])
    })

    it("when a component is added to an entity, archetype indices are automatically updated", () => {
      const { world, alice, bob } = setup()
      const admins = world.archetype("admin")
      expect(admins.entities).toEqual([alice])
      world.addComponent(bob, { admin: true })
      expect(admins.entities).toEqual([alice, bob])
    })

    it("when a component is removed from an entity, archetype indices are automatically updated", () => {
      const { world: ecs, alice, bob } = setup()
      const withAdmin = ecs.archetype("admin")
      const withName = ecs.archetype("name")

      expect(withAdmin.entities).toEqual([alice])
      expect(withName.entities).toEqual([alice, bob])

      ecs.removeComponent(alice, "admin")

      expect(withAdmin.entities).toEqual([])
      expect(withName.entities).toEqual([alice, bob])
    })

    it("when an entity is removed, archetype indices are automatically updated", () => {
      const { world, alice, bob } = setup()
      const withAdmin = world.archetype("admin")
      const withName = world.archetype("name")

      expect(withAdmin.entities).toEqual([alice])
      expect(withName.entities).toEqual([alice, bob])

      world.destroyEntity(alice)

      expect(withAdmin.entities).toEqual([])
      expect(withName.entities).toEqual([bob])
    })
  })
})
