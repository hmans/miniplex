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
  })
})
