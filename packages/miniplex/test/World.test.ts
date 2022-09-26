import { World } from "../src/World"

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
}

describe("World", () => {
  it("can be instantiated as a class", () => {
    const world = new World<Entity>()
    expect(world).toBeInstanceOf(World)
  })

  it("can be passed an initial list of entities", () => {
    const alice = { name: "Alice", admin: true }
    const bob = { name: "Bob", age: 42 }

    const world = new World<Entity>({ entities: [alice, bob] })

    expect(world.entities).toEqual([alice, bob])
  })

  describe("createEntity", () => {
    it("creates a new entity", () => {
      const world = new World<Entity>()
      const entity = world.createEntity({})
      expect(entity.__miniplex.id).not.toBeUndefined()
    })

    it("accepts a partial entity", () => {
      const world = new World<Entity>()
      const entity = world.createEntity({ name: "Alice" })
      expect(entity).toMatchObject({ name: "Alice" })
    })

    it("mutates and returns the same new object", () => {
      const world = new World<Entity>()
      const entity = { name: "Alice" }
      const returnedEntity = world.createEntity(entity)
      expect(returnedEntity).toBe(entity)
    })

    it("returns an entity type with the components passed to the function", () => {
      const world = new World<Entity>()
      const entity = world.createEntity({ name: "Alice" })
      const name: string = entity.name
    })

    it("allows for use of component factories", () => {
      /* NOTE: an earlier version of miniplex allowed multiple arguments to be passed
      into `createEntity`. This functionality was removed to improve API clarity.
      This test no longer tests something specific to miniplex, but it's still
      a useful example of how to use component factories. */

      const world = new World<GameObject>()

      const position = (x = 0, y = 0) => ({ position: { x, y } })
      const velocity = (x = 0, y = 0) => ({ velocity: { x, y } })

      const entity = world.createEntity({
        ...position(0, 0),
        ...velocity(5, 7)
      })

      expect(entity).toMatchObject({
        position: { x: 0, y: 0 },
        velocity: { x: 5, y: 7 }
      })
    })

    it("immediately adds the entity to the pool", () => {
      const world = new World<Entity>()
      expect(world.entities).toEqual([])
      const entity = world.createEntity({ name: "Alice" })
      expect(world.entities).toEqual([entity])
    })

    it("assigns an ID to the entity's miniplex component", () => {
      const world = new World<Entity>()
      const entity = world.createEntity({ name: "Alice" })
      expect(entity.__miniplex.id).toEqual(0)
    })

    it("uses the entity's array index as its ID", () => {
      const world = new World<Entity>()
      const entity = world.createEntity({ name: "Alice" })
      expect(entity.__miniplex.id).toEqual(world.entities.indexOf(entity, 0))
    })

    it("assigns a reference to the world to the entity's miniplex component", () => {
      const world = new World<Entity>()
      const entity = world.createEntity({ name: "Alice" })
      expect(entity.__miniplex.world).toEqual(world)
    })

    it("assigns automatically incrementing IDs", () => {
      const world = new World<Entity>()
      world.createEntity({ name: "Alice" })
      const entity = world.createEntity({ name: "Bob" })
      expect(entity.__miniplex.id).toEqual(1)
    })

    describe(".queued", () => {
      it("queues an entity to be added to the entity pool", () => {
        const world = new World<Entity>()
        const entity = world.queue.createEntity({ name: "Alice" })

        expect(world.entities.length).toEqual(0)
        world.queue.flush()
        expect(world.entities.length).toEqual(1)
      })

      it("returns nothing", () => {
        const world = new World<Entity>()
        const result = world.queue.createEntity({ name: "Alice" })
        expect(result).toBeUndefined()
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

    it("removes the internal Miniplex component", () => {
      const world = new World<GameObject>()
      const entity = world.createEntity({ position: { x: 0, y: 0 } })
      expect(entity).toHaveProperty("__miniplex")
      world.destroyEntity(entity)
      expect(entity).not.toHaveProperty("__miniplex")
    })
  })

  describe("extendEntity", () => {
    const position = (x: number = 0, y: number = 0) => ({ position: { x, y } })
    const velocity = (x: number = 0, y: number = 0) => ({ velocity: { x, y } })
    const health = (amount: number) => ({
      health: { max: amount, current: amount }
    })

    it("adds a component expressed as a partial entity", () => {
      const world = new World<GameObject>()
      const entity = world.createEntity(position(1, 2))

      world.extendEntity(entity, velocity(3, 4))

      expect(entity.velocity).toEqual({ x: 3, y: 4 })
    })

    it("adds multiple components expressed within the same partial entity", () => {
      const world = new World<GameObject>()
      const entity = world.createEntity(position(1, 2))

      world.extendEntity(entity, { ...velocity(3, 4), ...health(100) })

      expect(entity).toEqual({
        __miniplex: { id: 0, world, archetypes: [] },
        position: { x: 1, y: 2 },
        velocity: { x: 3, y: 4 },
        health: { max: 100, current: 100 }
      })
    })

    it("adds multiple components expressed as multiple partial entities", () => {
      const world = new World<GameObject>()
      const entity = world.createEntity({ ...position(0, 0) })

      world.extendEntity(entity, { ...velocity(3, 4), ...health(100) })

      expect(entity).toEqual({
        __miniplex: { id: 0, world, archetypes: [] },
        position: { x: 0, y: 0 },
        velocity: { x: 3, y: 4 },
        health: { max: 100, current: 100 }
      })
    })

    it("adds entities to relevant archetypes", () => {
      const world = new World<GameObject>()
      const withVelocity = world.archetype("velocity")

      const entity = world.createEntity({ ...position() })
      expect(withVelocity.entities).not.toContain(entity)

      world.extendEntity(entity, velocity())
      expect(withVelocity.entities).toContain(entity)
    })

    it("throws when the specified entity is not managed by this world", () => {
      const world = new World<GameObject>()
      const otherWorld = new World<GameObject>()
      const entity = otherWorld.createEntity({ position: { x: 0, y: 0 } })

      expect(() => {
        world.extendEntity(entity, velocity())
      }).toThrow()
    })

    it("throws when the component already exists on the entity", () => {
      const world = new World<GameObject>()
      const entity = world.createEntity(position())

      expect(() => {
        world.extendEntity(entity, position())
      }).toThrow()
    })
  })

  describe("addComponent", () => {
    it("adds a component to an entity", () => {
      const world = new World<GameObject>()
      const entity = world.createEntity({ position: { x: 0, y: 0 } })

      world.addComponent(entity, "velocity", { x: 1, y: 2 })

      expect(entity.velocity).toEqual({ x: 1, y: 2 })
    })

    it("uses the same object for the component value", () => {
      const world = new World<GameObject>()
      const entity = world.createEntity({ position: { x: 0, y: 0 } })

      const velocity = { x: 1, y: 2 }

      world.addComponent(entity, "velocity", velocity)

      expect(entity.velocity).toBe(velocity)
    })

    it("adds entities to relevant archetypes", () => {
      const world = new World<GameObject>()
      const withVelocity = world.archetype("velocity")

      const entity = world.createEntity({ position: { x: 0, y: 0 } })
      expect(withVelocity.entities).not.toContain(entity)

      world.addComponent(entity, "velocity", { x: 1, y: 2 })
      expect(withVelocity.entities).toContain(entity)
    })

    it("throws an error when the component already exists", () => {
      const world = new World<GameObject>()
      const entity = world.createEntity({ position: { x: 0, y: 0 } })

      world.addComponent(entity, "velocity", { x: 1, y: 2 })

      expect(() => {
        world.addComponent(entity, "velocity", { x: 3, y: 4 })
      }).toThrowErrorMatchingInlineSnapshot(
        `"Component \\"velocity\\" is already present in entity. Aborting!"`
      )
    })

    it("throws when the specified entity is not managed by this world", () => {
      const world = new World<GameObject>()
      const otherWorld = new World<GameObject>()
      const entity = otherWorld.createEntity({ position: { x: 0, y: 0 } })

      expect(() => {
        world.addComponent(entity, "velocity", { x: 1, y: 2 })
      }).toThrowErrorMatchingInlineSnapshot(
        `"Tried to add components to an entity that is not managed by this world."`
      )
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
      world.extendEntity(bob, { admin: true })
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

    it("when world is cleared, archetypes remain intact but have entities removed", () => {
      const { world, alice, bob } = setup()
      const withAdmin = world.archetype("admin")
      expect(withAdmin.entities.length).toEqual(1)

      world.clear()
      expect(withAdmin.entities.length).toEqual(0)

      world.createEntity({ name: "Alice 2.0", admin: true })
      expect(withAdmin.entities.length).toEqual(1)
    })

    describe("Archetype.first", () => {
      it("returns the first entity when the archetype has entities", () => {
        const { world, alice, bob } = setup()
        const withAdmin = world.archetype("admin")
        expect(withAdmin.first).toBe(alice)
      })

      it("returns null when the archetype has no entities", () => {
        const { world, alice, bob } = setup()
        const withAdmin = world.archetype("admin")
        world.removeComponent(alice, "admin")
        expect(withAdmin.first).toEqual(null)
      })
    })

    describe("Archetype[Symbol.iterator]", () => {
      it("iterates over the entities in the archetype", () => {
        const { world, alice } = setup()
        const withAdmin = world.archetype("admin")

        expect(withAdmin.entities.length).toEqual(1)

        /* The iterator allows us to iterate over the archetype itself. */
        for (const entity of withAdmin) {
          expect(entity).toBe(alice)
        }
      })
    })
  })
})
