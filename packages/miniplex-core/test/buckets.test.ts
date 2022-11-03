import { ArchetypeBucket, EntityBucket, PredicateBucket } from "../src"

type Entity = {
  name: string
  age?: number
  height?: number
}

describe(EntityBucket, () => {
  describe("where", () => {
    it("returns an iterator that allows us to iterate over the entities in the bucket that satisfy the given predicate", () => {
      const bucket = new EntityBucket<Entity>()

      const john = bucket.add({ name: "John", age: 45 })
      const jane = bucket.add({ name: "Jane", age: 42 })
      const bob = bucket.add({ name: "Bob", age: 35 })
      const sally = bucket.add({ name: "Sally" })

      const results = []

      for (const e of bucket.where((e) => Number(e.age) > 40)) {
        results.push(e)
      }

      expect(results).toEqual([jane, john])
    })
  })

  describe("archetype", () => {
    describe("with a query object", () => {
      it("returns an archetype bucket wrapping that query", () => {
        const bucket = new EntityBucket<Entity>()
        const archetype = bucket.archetype({
          with: ["age"],
          without: ["height"]
        })
        const john = bucket.add({ name: "John", age: 30 })
        const jane = bucket.add({ name: "Jane", age: 28, height: 170 })
        expect(archetype).toBeInstanceOf(ArchetypeBucket)
        expect(archetype.entities).toEqual([john])
      })

      it("always returns the same archetype bucket for equal queries", () => {
        const bucket = new EntityBucket<Entity>()

        const archetype1 = bucket.archetype({
          with: ["age", null, "name"],
          without: [undefined, "height"]
        })

        const archetype2 = bucket.archetype({
          with: ["name", "age"],
          without: ["height"]
        })

        expect(archetype1).toBe(archetype2)
      })
    })

    describe("with a list of components", () => {
      it("returns an archetype containing all entities that have the specified components", () => {
        const bucket = new EntityBucket<Entity>()
        const john = bucket.add({ name: "John", age: 30 })
        const jane = bucket.add({ name: "Jane" })

        const withAge = bucket.archetype("age")
        expect(withAge).toBeInstanceOf(ArchetypeBucket)
        expect(withAge.entities).toEqual([john])
      })

      it("always returns the same archetype bucket for equal queries", () => {
        const bucket = new EntityBucket<Entity>()
        const withAge1 = bucket.archetype("name", undefined!, "age")
        const withAge2 = bucket.archetype("age", "name")
        expect(withAge1).toBe(withAge2)
      })
    })

    describe("with a predicate", () => {
      describe("derive", () => {
        it("returns a PredicateBucket", () => {
          const bucket = new EntityBucket<Entity>()
          const predicate = (entity: Entity) => entity.age !== undefined
          const predicateBucket = bucket.archetype(predicate)
          expect(predicateBucket.archetype(predicate)).toBeInstanceOf(
            PredicateBucket
          )
          expect(predicateBucket.predicate).toBe(predicate)
        })

        it("returns an archetype containing all entities that satisfy the specified predicate", () => {
          const bucket = new EntityBucket<Entity>()
          const john = bucket.add({ name: "John", age: 30 })
          const jane = bucket.add({ name: "Jane" })

          const withAge = bucket.archetype((entity) => Number(entity.age) > 25)
          expect(withAge).toBeInstanceOf(PredicateBucket)
          expect(withAge.entities).toEqual([john])
        })

        it("always returns the same archetype bucket for identical predicates", () => {
          const bucket = new EntityBucket<Entity>()
          const predicate = (entity: Entity) => Number(entity.age) > 25
          const withAge1 = bucket.archetype(predicate)
          const withAge2 = bucket.archetype(predicate)
          expect(withAge1).toBe(withAge2)
        })
      })
    })

    it("indexes entities already present in the world", () => {
      const bucket = new EntityBucket<Entity>()
      const entity = bucket.add({ name: "John", age: 30 })

      const withAge = bucket.archetype({ with: ["age"] })
      expect(withAge.entities).toEqual([entity])
    })

    it("can be nested", () => {
      const bucket = new EntityBucket<Entity>()
      const entity: Entity = bucket.add({ name: "John", age: 30 })

      const withAge = bucket.with("name").with("age")
      expect(withAge.entities).toEqual([entity])

      bucket.update(entity, (e) => delete e.age)
      expect(withAge.entities).toEqual([])

      bucket.update(entity, (e) => (e.age = 30))
      expect(withAge.entities).toEqual([entity])
    })
  })

  describe("with", () => {
    it("returns an archetype containing all entities that have the specified components", () => {
      const bucket = new EntityBucket<Entity>()
      const john = bucket.add({ name: "John", age: 30 })
      const jane = bucket.add({ name: "Jane" })

      const withAge = bucket.with("age")
      expect(withAge).toBeInstanceOf(ArchetypeBucket)
      expect(withAge.entities).toEqual([john])
    })

    it("always returns the same archetype bucket for equal queries", () => {
      const bucket = new EntityBucket<Entity>()
      const withAge1 = bucket.with("name", undefined!, "age")
      const withAge2 = bucket.with("age", "name")
      expect(withAge1).toBe(withAge2)
    })
  })

  describe("without", () => {
    it("returns an archetype containing all entities that do not have the specified components", () => {
      const bucket = new EntityBucket<Entity>()
      const john = bucket.add({ name: "John", age: 30 })
      const jane = bucket.add({ name: "Jane" })

      const withoutAge = bucket.without("age")
      expect(withoutAge).toBeInstanceOf(ArchetypeBucket)
      expect(withoutAge.entities).toEqual([jane])
    })

    it("always returns the same archetype bucket for equal queries", () => {
      const bucket = new EntityBucket<Entity>()
      const withoutAge1 = bucket.without("name", undefined!, "age")
      const withoutAge2 = bucket.without("age", "name")
      expect(withoutAge1).toBe(withoutAge2)
    })
  })

  describe("add", () => {
    it("adds an entity", () => {
      const bucket = new EntityBucket<Entity>()
      const entity = bucket.add({ name: "John" })
      expect(bucket.entities).toEqual([entity])
    })

    it("adds the entity to any relevant archetypes", () => {
      const bucket = new EntityBucket<Entity>()
      const archetype = bucket.archetype({ with: ["age"] })
      const entity = bucket.add({ name: "John", age: 30 })
      expect(archetype.entities).toEqual([entity])
    })
  })

  describe("remove", () => {
    it("removes an entity", () => {
      const bucket = new EntityBucket<Entity>()
      const entity = bucket.add({ name: "John" })
      expect(bucket.entities).toEqual([entity])

      bucket.remove(entity)
      expect(bucket.entities).toEqual([])
    })

    it("removes the entity from any relevant archetypes", () => {
      const bucket = new EntityBucket<Entity>()
      const archetype = bucket.archetype({ with: ["age"] })
      const entity = bucket.add({ name: "John", age: 30 })
      expect(archetype.entities).toEqual([entity])

      bucket.remove(entity)
      expect(archetype.entities).toEqual([])
    })
  })

  describe("update", () => {
    it("updates the entity using a function", () => {
      const bucket = new EntityBucket<Entity>()
      const entity = bucket.add({ name: "John" })
      expect(entity.name).toBe("John")

      bucket.update(entity, (e) => (e.age = 45))
      expect(entity.age).toBe(45)
    })

    it("updates the entity using an object", () => {
      const bucket = new EntityBucket<Entity>()
      const entity = bucket.add({ name: "John" })
      expect(entity.name).toBe("John")

      bucket.update(entity, { age: 45 })
      expect(entity.age).toBe(45)
    })

    it("updates the entity using an object returned by a function", () => {
      const bucket = new EntityBucket<Entity>()
      const entity = bucket.add({ name: "John" })
      expect(entity.name).toBe("John")

      bucket.update(entity, () => ({ age: 45 }))
      expect(entity.age).toBe(45)
    })

    it("updates relevant archetypes", () => {
      const bucket = new EntityBucket<Entity>()
      const withAge = bucket.with("age")

      const entity = bucket.add({ name: "John" })
      expect(withAge.entities).toEqual([])

      bucket.update(entity, { age: 45 })
      expect(withAge.entities).toEqual([entity])
    })

    it("passes the modified entity to the onEntityAdded callback", () => {
      const bucket = new EntityBucket<Entity>()
      const entity = bucket.add({ name: "John" })
      const withAge = bucket.with("age")

      let age: number | undefined
      withAge.onEntityAdded.add((e) => (age = e.age))

      bucket.update(entity, (e) => (e.age = 45))
      expect(age).toEqual(45)
    })

    it("passes the modified entity to the onEntityRemoved callback", () => {
      const bucket = new EntityBucket<Entity>()
      const entity = bucket.add({ name: "John", age: 45 })
      const withAge = bucket.with("age")

      let age: number | undefined
      withAge.onEntityRemoved.add((e) => (age = e.age))

      bucket.update(entity, (e) => delete e.age)
      expect(age).toBeUndefined
    })
  })
})
