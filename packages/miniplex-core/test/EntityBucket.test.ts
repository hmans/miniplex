import { Archetype, EntityBucket, With } from "../src"

type Entity = {
  name: string
  age?: number
  height?: number
}

type EntityWithAge = With<Entity, "age">

describe(EntityBucket, () => {
  describe("archetype", () => {
    it("returns an archetype bucket", () => {
      const bucket = new EntityBucket<Entity>()
      const archetype = bucket.archetype({ with: ["age"] })
      expect(archetype).toBeInstanceOf(Archetype)
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
