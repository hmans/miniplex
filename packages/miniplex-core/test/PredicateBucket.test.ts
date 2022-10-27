import { PredicateBucket } from "../src/PredicateBucket"

describe(PredicateBucket, () => {
  describe("add", () => {
    it("only adds the entity if it satisfies the bucket's predicate", () => {
      const bucket = new PredicateBucket<{ id: number }>(
        (entity) => entity.id === 1
      )
      const entity = { id: 1 }

      bucket.add(entity)
      expect(bucket.has(entity)).toBe(true)

      bucket.add({ id: 2 })
      expect(bucket.size).toBe(1)
    })
  })
})
