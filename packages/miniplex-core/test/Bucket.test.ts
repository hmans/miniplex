import { Bucket } from "../src/Bucket"
import { WithComponents } from "../src/types"

describe("Bucket", () => {
  describe("add", () => {
    it("adds an entity to the bucket", () => {
      const bucket = new Bucket()
      const entity = { id: 1 }

      bucket.add(entity)

      expect(bucket.has(entity)).toBe(true)
    })

    it("does not add an entity twice", () => {
      const bucket = new Bucket()
      const entity = { id: 1 }

      bucket.add(entity)
      bucket.add(entity)

      expect(bucket.has(entity)).toBe(true)
      expect(bucket.size).toBe(1)
    })

    it("no-ops when entity is undefined", () => {
      const bucket = new Bucket()

      bucket.add(undefined)

      expect(bucket.size).toBe(0)
    })

    it("emits the onEntityAdded event", () => {
      const bucket = new Bucket()
      const entity = { id: 1 }
      const spy = jest.fn()

      bucket.onEntityAdded.add(spy)
      bucket.add(entity)

      expect(spy).toHaveBeenCalledWith(entity)
    })

    it("respects the bucket's predicate", () => {
      const bucket = new Bucket<{ id: number }>({
        predicate: (entity) => entity.id % 2 === 0
      })

      const odd = { id: 1 }
      const even = { id: 2 }

      bucket.add(odd)
      bucket.add(even)

      expect(bucket.has(odd)).toBe(false)
      expect(bucket.has(even)).toBe(true)
    })
  })

  describe("remove", () => {
    it("removes an entity from the bucket", () => {
      const bucket = new Bucket()
      const entity = { id: 1 }

      bucket.add(entity)
      expect(bucket.has(entity)).toBe(true)

      bucket.remove(entity)
      expect(bucket.has(entity)).toBe(false)
    })

    it("no-ops when the entity is undefined", () => {
      const bucket = new Bucket()
      bucket.remove(undefined)
      expect(bucket.size).toBe(0)
    })

    it("doesn't crash when removing the same entity twice", () => {
      const bucket = new Bucket()
      const entity = { id: 1 }

      bucket.add(entity)
      expect(bucket.size).toBe(1)

      bucket.remove(entity)
      bucket.remove(entity)
      expect(bucket.size).toBe(0)
    })

    it("emits the onEntityRemoved event", () => {
      const bucket = new Bucket()
      const entity = { id: 1 }
      const spy = jest.fn()

      bucket.add(entity)
      bucket.onEntityRemoved.add(spy)
      bucket.remove(entity)

      expect(spy).toHaveBeenCalledWith(entity)
    })
  })

  describe("derive", () => {
    it("creates a derived bucket that receives this bucket's entities filtered by a predicate", () => {
      const bucket = new Bucket<{ id: number }>()
      const derived = bucket.derive((entity) => entity.id % 2 === 0)

      const odd = { id: 1 }
      const even = { id: 2 }

      bucket.add(odd)
      bucket.add(even)

      expect(derived.has(odd)).toBe(false)
      expect(derived.has(even)).toBe(true)
    })

    it("automatically puts entities that are already present into the derived bucket", () => {
      const bucket = new Bucket<{ id: number }>()
      const odd = { id: 1 }
      const even = { id: 2 }

      bucket.add(odd)
      bucket.add(even)

      const derived = bucket.derive((entity) => entity.id % 2 === 0)

      expect(derived.has(odd)).toBe(false)
      expect(derived.has(even)).toBe(true)
    })

    it("captures the predicate's type guard if it has one", () => {
      type Entity = { name: string; age?: number }
      const bucket = new Bucket<Entity>()

      const hasAge = (
        entity: Entity
      ): entity is WithComponents<Entity, "age"> => entity.age !== undefined

      bucket.add({ name: "Alice", age: 25 })

      const derived = bucket.derive(hasAge)
      derived.entities[0].age.toString()
      /* test is no-op, we just don't want type errors above in the line above */
    })
  })

  it("iterates over its entities in the reverse order", () => {
    const bucket = new Bucket()
    const entity1 = { id: 1 }
    const entity2 = { id: 2 }

    bucket.add(entity1)
    bucket.add(entity2)

    expect([...bucket]).toEqual([entity2, entity1])
  })
})
