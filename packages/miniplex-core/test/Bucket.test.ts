import { Bucket } from "../src/Bucket"

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

  it("iterates over its entities in the reverse order", () => {
    const bucket = new Bucket()
    const entity1 = { id: 1 }
    const entity2 = { id: 2 }

    bucket.add(entity1)
    bucket.add(entity2)

    expect([...bucket]).toEqual([entity2, entity1])
  })
})
