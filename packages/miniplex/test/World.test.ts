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

  describe("createEntity", () => {
    it("creates a new entity", () => {
      const world = new World<Entity>()
      const id = world.createEntity()
      expect(id).not.toBeUndefined()
      expect(id).toEqual(0)
    })

    it("accepts a partial entity", () => {
      const world = new World<Entity>()
      const id = world.createEntity({ name: "Alice" })
      expect(id).toEqual(0)
    })

    it("mutates the first argument", () => {
      const world = new World<Entity>()
      const entity: Partial<Entity> = { name: "Alice" }
      world.createEntity(entity, { admin: true })
      expect(entity).toMatchObject({
        name: "Alice",
        admin: true
      })
    })

    it("accepts multiple partial entities that are merged into the same entity object", () => {
      const world = new World<Entity>()
      const id = world.createEntity({ name: "Alice" }, { admin: true })
      expect(world.entities[id]).toMatchObject({
        name: "Alice",
        admin: true
      })
    })

    it("allows for use of component factories", () => {
      const world = new World<GameObject>()

      const position = (x = 0, y = 0) => ({ position: { x, y } })
      const velocity = (x = 0, y = 0) => ({ velocity: { x, y } })

      const id = world.createEntity(position(0, 0), velocity(5, 7))
      expect(world.getEntity(id)).toMatchObject({
        position: { x: 0, y: 0 },
        velocity: { x: 5, y: 7 }
      })
    })

    it("immediately adds the entity to the pool", () => {
      const world = new World<Entity>()
      expect(world.entities.length).toEqual(0)
      world.createEntity({ name: "Alice" })
      expect(world.entities.length).toEqual(1)
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
      const id = world.createEntity({ position: { x: 0, y: 0 } })
      const entity = world.getEntity(id)

      expect(world.entities).toContain(entity)
      world.destroyEntity(id)
      expect(world.entities).not.toContain(entity)
    })

    it("removes the entity from all archetypes", () => {
      const world = new World<GameObject>()
      const withVelocity = world.archetype("velocity")
      const id = world.createEntity({
        position: { x: 0, y: 0 },
        velocity: { x: 1, y: 2 }
      })
      const entity = world.getEntity(id)

      expect(withVelocity.entities).toContain(entity)
      world.destroyEntity(id)
      expect(withVelocity.entities).not.toContain(entity)
    })

    it("removes the internal Miniplex component", () => {
      const world = new World<GameObject>()
      const id = world.createEntity({ position: { x: 0, y: 0 } })
      const entity = world.getEntity(id)

      expect(entity).toHaveProperty("__miniplex")
      world.destroyEntity(id)
      expect(entity).not.toHaveProperty("__miniplex")
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
      const id = world.createEntity()
      const entity = world.getEntity(id)

      world.addComponent(id, position(1, 2))

      expect(entity.position).toEqual({ x: 1, y: 2 })
    })

    it("adds multiple components expressed within the same partial entity", () => {
      const world = new World<GameObject>()
      const id = world.createEntity()

      world.addComponent(id, { ...position(1, 2), ...health(100) })

      expect(world.getEntity(id)).toEqual({
        __miniplex: { archetypes: [] },
        position: { x: 1, y: 2 },
        health: { max: 100, current: 100 }
      })
    })

    it("adds multiple components expressed as multiple partial entitie", () => {
      const world = new World<GameObject>()
      const id = world.createEntity()

      world.addComponent(id, position(1, 2), health(100))

      expect(world.getEntity(id)).toEqual({
        __miniplex: { archetypes: [] },
        position: { x: 1, y: 2 },
        health: { max: 100, current: 100 }
      })
    })

    it("adds entities to relevant archetypes", () => {
      const world = new World<GameObject>()
      const withVelocity = world.archetype("velocity")

      const id = world.createEntity({ ...position() })
      const entity = world.getEntity(id)
      expect(withVelocity.entities).not.toContain(entity)

      world.addComponent(id, velocity())
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
      const id = world.createEntity({
        position: { x: 0, y: 0 },
        velocity: { x: 1, y: 2 }
      })
      const entity = world.getEntity(id)
      expect(withVelocity.entities).toContain(entity)
      world.removeComponent(id, "velocity")
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
      const aliceId = world.createEntity({ name: "Alice", admin: true })
      const bobId = world.createEntity({ name: "Bob" })
      const alice = world.getEntity(aliceId)
      const bob = world.getEntity(bobId)
      return { world, alice, bob, aliceId, bobId }
    }

    it("maintain indices of entities that have a specific set of components", () => {
      const { world, alice } = setup()
      const admins = world.archetype("admin")
      expect(admins.entities).toEqual([alice])
    })

    it("when a component is added to an entity, archetype indices are automatically updated", () => {
      const { world, alice, bob, bobId } = setup()
      const admins = world.archetype("admin")
      expect(admins.entities).toEqual([alice])
      world.addComponent(bobId, { admin: true })
      expect(admins.entities).toEqual([alice, bob])
    })

    it("when a component is removed from an entity, archetype indices are automatically updated", () => {
      const { world: ecs, alice, bob, aliceId } = setup()
      const withAdmin = ecs.archetype("admin")
      const withName = ecs.archetype("name")

      expect(withAdmin.entities).toEqual([alice])
      expect(withName.entities).toEqual([alice, bob])

      ecs.removeComponent(aliceId, "admin")

      expect(withAdmin.entities).toEqual([])
      expect(withName.entities).toEqual([alice, bob])
    })

    it("when an entity is removed, archetype indices are automatically updated", () => {
      const { world, alice, bob, aliceId } = setup()
      const withAdmin = world.archetype("admin")
      const withName = world.archetype("name")

      expect(withAdmin.entities).toEqual([alice])
      expect(withName.entities).toEqual([alice, bob])

      world.destroyEntity(aliceId)

      expect(withAdmin.entities).toEqual([])
      expect(withName.entities).toEqual([bob])
    })
  })
})
