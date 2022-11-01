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

  describe("derive", () => {
    it("returns a PredicateBucket", () => {
      const bucket = new EntityBucket<Entity>()
      const predicate = (entity: Entity) => entity.age !== undefined
      const predicateBucket = bucket.derive(predicate)
      expect(predicateBucket.derive(predicate)).toBeInstanceOf(PredicateBucket)
      expect(predicateBucket.predicate).toBe(predicate)
    })

    it("returns an archetype containing all entities that satisfy the specified predicate", () => {
      const bucket = new EntityBucket<Entity>()
      const john = bucket.add({ name: "John", age: 30 })
      const jane = bucket.add({ name: "Jane" })

      const withAge = bucket.derive((entity) => Number(entity.age) > 25)
      expect(withAge).toBeInstanceOf(PredicateBucket)
      expect(withAge.entities).toEqual([john])
    })

    it("always returns the same archetype bucket for identical predicates", () => {
      const bucket = new EntityBucket<Entity>()
      const predicate = (entity: Entity) => Number(entity.age) > 25
      const withAge1 = bucket.derive(predicate)
      const withAge2 = bucket.derive(predicate)
      expect(withAge1).toBe(withAge2)
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
      it("passes the predicate to its .where() function", () => {
        const bucket = new EntityBucket<Entity>()
        const predicate = (entity: Entity) => entity.age !== undefined
        const withAge = bucket.archetype(predicate)
        expect(withAge).toBeInstanceOf(PredicateBucket)
        expect(withAge.predicate).toBe(predicate)

        const withAge2 = bucket.derive(predicate)
        expect(withAge).toBe(withAge2)
      })
    })

    it("indexes entities already present in the world", () => {
      const bucket = new EntityBucket<Entity>()
      const entity = bucket.add({ name: "John", age: 30 })

      const withAge = bucket.archetype({ with: ["age"] })
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
})
