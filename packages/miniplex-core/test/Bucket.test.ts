import { Bucket } from "../src/Bucket"
import { query } from "../src/queries"
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

    it("returns the same derived buckets for the same predicates", () => {
      const bucket = new Bucket()
      const predicate = () => true
      const derived1 = bucket.derive(predicate)
      const derived2 = bucket.derive(predicate)

      expect(derived1).toBe(derived2)
    })

    it("returns the same derived buckets for the same queries", () => {
      const bucket = new Bucket()
      const derived1 = bucket.derive(query({ all: ["moo"] }))
      const derived2 = bucket.derive(query({ all: ["moo"] }))
      const derived3 = bucket.derive(query({ all: ["quack"] }))

      expect(derived1).toBe(derived2)
      expect(derived2).not.toBe(derived3)
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

  describe("all/any/none", () => {
    it("creates a derived bucket", () => {
      type Entity = { name?: string; age?: number }
      const bucket = new Bucket<Entity>()
      const withAge = bucket.all("age")
      const withAgeAndName = withAge.all("name")
      const withAgeButNoName = withAge.none("name")

      const alice = bucket.add({ name: "Alice", age: 25 })

      expect(withAge.entities).toEqual([alice])
      expect(withAgeAndName.entities).toEqual([alice])
      expect(withAgeButNoName.entities).toEqual([])
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
