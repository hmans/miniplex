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
    it("adds the entity to the bucket", () => {
      const bucket = new Bucket()
      const entity = { id: "1" }

      bucket.add(entity)

      expect(bucket.entities).toContain(entity)
    })

    it("returns the entity", () => {
      const bucket = new Bucket()
      const entity = { id: "1" }

      const result = bucket.add(entity)

      expect(result).toBe(entity)
    })

    it("ignores nullish entities", () => {
      const bucket = new Bucket()

      bucket.add(null)
      bucket.add(undefined)

      expect(bucket.entities).toHaveLength(0)
    })

    it("emits the onEntityAdded event", () => {
      const bucket = new Bucket()
      const entity = { id: "1" }
      const listener = jest.fn()

      bucket.onEntityAdded.add(listener)
      bucket.add(entity)

      expect(listener).toHaveBeenCalledWith(entity)
    })
  })

  describe("remove", () => {
    it("removes the entity from the bucket", () => {
      const bucket = new Bucket()
      const entity = { id: "1" }

      bucket.add(entity)
      bucket.remove(entity)

      expect(bucket.entities).not.toContain(entity)
    })

    it("returns the entity", () => {
      const bucket = new Bucket()
      const entity = { id: "1" }

      const result = bucket.remove(entity)

      expect(result).toBe(entity)
    })

    it("emits the onEntityRemoved event", () => {
      const bucket = new Bucket()
      const entity = bucket.add({ id: "1" })
      const listener = jest.fn()

      bucket.onEntityRemoved.add(listener)
      bucket.remove(entity)

      expect(listener).toHaveBeenCalledWith(entity)
    })
  })

  describe("size", () => {
    it("returns the number of entities in the bucket", () => {
      const bucket = new Bucket()

      bucket.add({ id: "1" })
      bucket.add({ id: "2" })

      expect(bucket.size).toBe(2)
    })
  })

  describe("clear", () => {
    it("removes all entities from the bucket", () => {
      const bucket = new Bucket()

      bucket.add({ id: "1" })
      bucket.add({ id: "2" })
      bucket.clear()

      expect(bucket.size).toBe(0)
    })

    it("emits the onEntityRemoved event for each entity", () => {
      const bucket = new Bucket()
      const entity1 = bucket.add({ id: "1" })
      const entity2 = bucket.add({ id: "2" })
      const listener = jest.fn()

      bucket.onEntityRemoved.add(listener)
      bucket.clear()

      expect(listener).toHaveBeenCalledWith(entity1)
      expect(listener).toHaveBeenCalledWith(entity2)
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
