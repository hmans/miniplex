import { createECS, IEntity } from "../src/ecs"

/* hmecs supports entity type checking. \o/ */
type OldTestEntity = {
  foo?: string
  bar?: string
  shared?: boolean
} & IEntity

type Entity = {
  name?: string
  age?: number
  admin?: boolean
} & IEntity

describe(createECS, () => {
  describe("addEntity", () => {
    it("queues an entity to be added to the entity pool", () => {
      const ecs = createECS<Entity>()
      const entity = ecs.addEntity({ name: "Alice" })
      expect(ecs.entities).not.toContain(entity)
      ecs.flush()
      expect(ecs.entities).toContain(entity)
    })

    it("immediately assigns an ID", () => {
      const ecs = createECS<Entity>()
      const entity = ecs.addEntity({ name: "Alice" })
      expect(entity.id).toEqual(1)

      /* Flushing won't change the ID */
      ecs.flush()
      expect(entity.id).toEqual(1)
    })

    it("assigns an automatically incrementing ID", () => {
      const ecs = createECS<Entity>()
      ecs.addEntity({ name: "Alice" })
      const entity = ecs.addEntity({ name: "Bob" })
      expect(entity.id).toEqual(2)
    })

    it("accepts an object that will become the entity", () => {
      const ecs = createECS<Entity>()
      const entity: Entity = { name: "Alice " }
      const returnedEntity = ecs.addEntity(entity)
      expect(returnedEntity).toBe(entity)
    })
  })

  describe("archetypes", () => {
    const setup = () => {
      const ecs = createECS<Entity>()
      const alice = ecs.immediately.addEntity({ name: "Alice", admin: true })
      const bob = ecs.immediately.addEntity({ name: "Bob" })

      return { ecs, alice, bob }
    }

    it("maintain indices of entities that have a specific set of components", () => {
      const { ecs, alice } = setup()
      const admins = ecs.archetype("admin")
      expect(ecs.get(admins)).toEqual([alice])
    })

    it("when a component is added to an entity, archetype indices are automatically updated", () => {
      const { ecs, alice, bob } = setup()
      const admins = ecs.archetype("admin")
      expect(ecs.get(admins)).toEqual([alice])
      ecs.immediately.addComponent(bob, { admin: true })
      expect(ecs.get(admins)).toEqual([alice, bob])
    })

    it("when a component is removed from an entity, archetype indices are automatically updated", () => {
      const { ecs, alice } = setup()
      const admins = ecs.archetype("admin")
      expect(ecs.get(admins)).toEqual([alice])
      ecs.immediately.removeComponent(alice, "admin")
      expect(ecs.get(admins)).toEqual([])
    })

    it("when an entity is removed, archetype indices are automatically updated", () => {
      const { ecs, alice } = setup()
      const admins = ecs.archetype("admin")
      expect(ecs.get(admins)).toEqual([alice])
      ecs.immediately.removeEntity(alice)
      expect(ecs.get(admins)).toEqual([])
    })
  })

  it("works (old test)", () => {
    const ecs = createECS<OldTestEntity>()

    const foo = {
      shared: true,
      foo: "foo"
    }

    const bar = {
      shared: true,
      bar: "bar"
    }

    /* We're adding one entity before archetypes are created... */
    ecs.addEntity(foo)

    const withFoo = ecs.archetype("foo")
    const withBar = ecs.archetype("bar")
    const withShared = ecs.archetype("shared")

    /* ...and one after. */
    ecs.addEntity(bar)

    /* Flush all queues */
    ecs.flush()

    expect(ecs.get(withFoo))
    expect(ecs.get(withFoo)).toEqual([foo])
    expect(ecs.get(withBar)).toEqual([bar])
    expect(ecs.get(withShared)).toEqual([foo, bar])

    /* Update an empty (but queued) */
    ecs.removeComponent(foo, "shared")

    /* The entity should still be in the index... */
    expect(ecs.get(withShared)).toEqual([foo, bar])

    /* ...until we flush the command queue. */
    ecs.flush()
    expect(ecs.get(withShared)).toEqual([bar])

    /* Now do the same for removing an entity. */
    ecs.removeEntity(foo)
    expect(ecs.get(withFoo)).toEqual([foo])
    ecs.flush()
    expect(ecs.get(withFoo)).toEqual([])
  })
})
