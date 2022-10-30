import { World } from "../../miniplex/src"
import { Bucket } from "../src"

describe(Bucket, () => {
  it("can be instantiated", () => {
    const bucket = new Bucket()
    expect(bucket).toBeInstanceOf(Bucket)
  })

  it("can be instantiated with a list of entities", () => {
    const bucket = new Bucket([1, 2, 3])
    expect(bucket).toBeInstanceOf(Bucket)
    expect(bucket.size).toBe(3)
  })

  describe("add", () => {
    it("only adds the entity when it satisfies the bucket's predicate", () => {
      const bucket = new Bucket([1, 2, 3], (entity) => entity % 2 === 0)
      expect(bucket.entities).toEqual([2])
    })

    it("adds the entity to any matching derived buckets", () => {
      const bucket = new Bucket()
      const derivedBucket = bucket.where(() => true)
      const entity = bucket.add({ id: 1 })

      expect(derivedBucket.entities).toContain(entity)
    })
  })

  describe("remove", () => {
    it("removes the entity from any derived buckets", () => {
      const bucket = new Bucket()
      const entity = bucket.add({ id: "1" })
      const derivedBucket = bucket.where(() => true)

      bucket.remove(entity)

      expect(derivedBucket.entities).not.toContain(entity)
    })
  })

  describe("where", () => {
    it("will return a new bucket that only holds the entities that match the given predicate", () => {
      const bucket = new Bucket([1, 2, 3])
      const derived = bucket.where((v) => v > 1)
      expect(derived.entities).toEqual([2, 3])
    })

    it("returns the same bucket for the same predicate (by referential equality)", () => {
      const bucket = new Bucket([1, 2, 3])
      const predicate = (v: number) => v > 1
      const derived1 = bucket.where(predicate)
      const derived2 = bucket.where(predicate)
      expect(derived1).toBe(derived2)
    })

    it("creates a bucket that is updated automatically for entities that are explicitly marked as dirty", () => {
      type Entity = { health: number }

      const bucket = new Bucket<Entity>()
      const player = bucket.add({ health: 30 })
      const lowHealth = bucket.where((p) => p.health < 25)

      function applyDamage(entity: Entity, amount = 10) {
        entity.health -= amount
        bucket.mark(entity)
      }

      expect(lowHealth.entities).toEqual([])

      /* Ouch, something hit the player */
      applyDamage(player)

      /* This would typically be done once per tick, or similar */
      bucket.flushMarked()

      expect(lowHealth.entities).toEqual([player])
    })
  })
})
