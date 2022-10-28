import { DerivableBucket } from "../src"

describe(DerivableBucket, () => {
  it("can be instantiated", () => {
    const bucket = new DerivableBucket()
    expect(bucket).toBeInstanceOf(DerivableBucket)
  })

  it("can be instantiated with a list of entities", () => {
    const bucket = new DerivableBucket([1, 2, 3])
    expect(bucket.entities).toEqual([1, 2, 3])
  })

  describe("derive", () => {
    it("will return a new bucket that only holds the entities that match the given predicate", () => {
      const bucket = new DerivableBucket([1, 2, 3])
      const derived = bucket.derive((v) => v > 1)
      expect(derived.entities).toEqual([2, 3])
    })

    it("returns the same bucket for the same predicate (by referential equality)", () => {
      const bucket = new DerivableBucket([1, 2, 3])
      const predicate = (v: number) => v > 1
      const derived1 = bucket.derive(predicate)
      const derived2 = bucket.derive(predicate)
      expect(derived1).toBe(derived2)
    })
  })
})
