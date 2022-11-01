import { ArchetypeBucket, EntityBucket, PredicateBucket, With } from "../src"

type Entity = {
  name: string
  age?: number
  height?: number
}

type EntityWithAge = With<Entity, "age">

describe(EntityBucket, () => {
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
    })

    describe("with a predicate", () => {
      it("returns an archetype containing all entities that satisfy the specified predicate", () => {
        const bucket = new EntityBucket<Entity>()
        const john = bucket.add({ name: "John", age: 30 })
        const jane = bucket.add({ name: "Jane" })

        const withAge = bucket.archetype((entity) => Number(entity.age) > 25)
        expect(withAge).toBeInstanceOf(PredicateBucket)
        expect(withAge.entities).toEqual([john])
      })
    })

    it("indexes entities already present in the world", () => {
      const bucket = new EntityBucket<Entity>()
      const entity = bucket.add({ name: "John", age: 30 })

      const withAge = bucket.archetype({ with: ["age"] })
      expect(withAge.entities).toEqual([entity])
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
