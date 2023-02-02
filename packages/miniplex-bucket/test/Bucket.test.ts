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

    it("emits the onAdd event", () => {
      const bucket = new Bucket()
      const entity = { id: "1" }
      const listener = jest.fn()

      bucket.onAdd.subscribe(listener)
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

    it("emits the onRemove event", () => {
      const bucket = new Bucket()
      const entity = bucket.add({ id: "1" })
      const listener = jest.fn()

      bucket.onRemove.subscribe(listener)
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

  describe("first", () => {
    it("returns the first entity in the bucket", () => {
      const bucket = new Bucket()
      const entity = bucket.add({ id: "1" })
      bucket.add({ id: "2" })

      expect(bucket.first).toBe(entity)
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

      bucket.onRemove.subscribe(listener)
      bucket.clear()

      expect(listener).toHaveBeenCalledWith(entity1)
      expect(listener).toHaveBeenCalledWith(entity2)
    })
  })

  describe("onEnter event", () => {
    it("is emitted when an entity is added to the bucket", () => {
      const bucket = new Bucket()
      const entity = { id: "1" }
      const listener = jest.fn()

      bucket.onEnter.subscribe(listener)
      bucket.add(entity)

      expect(listener).toHaveBeenCalledWith(entity)
    })

    it("automatically applies to entities that are already in the bucket", () => {
      const bucket = new Bucket([1, 2, 3])
      const listener = jest.fn()

      bucket.onEnter.subscribe(listener)

      expect(listener).toHaveBeenCalledTimes(3)
    })
  })

  describe("onAdd event", () => {
    it("is emitted when an entity is added to the bucket", () => {
      const bucket = new Bucket()
      const entity = { id: "1" }
      const listener = jest.fn()

      bucket.onAdd.subscribe(listener)
      bucket.add(entity)

      expect(listener).toHaveBeenCalledWith(entity)
    })

    it("is not applied to entities already in the bucket", () => {
      const bucket = new Bucket([1, 2, 3])
      const listener = jest.fn()

      bucket.onAdd.subscribe(listener)

      expect(listener).toHaveBeenCalledTimes(0)
    })
  })

  describe("onRemove event", () => {
    it("is emitted when an entity is removed from the bucket", () => {
      const bucket = new Bucket()
      const entity = bucket.add({ id: "1" })
      const listener = jest.fn()

      bucket.onRemove.subscribe(listener)
      bucket.remove(entity)

      expect(listener).toHaveBeenCalledWith(entity)
    })
  })
})
