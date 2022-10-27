import { Bucket } from "../src"
import { query } from "../src/queries"

describe("query", () => {
  it("constructs a predicate that checks the given query", () => {
    const predicate = query({
      all: ["id"],
      any: ["name", "age"],
      none: ["foo", "bar"]
    })

    const entity = {
      id: 1,
      name: "John",
      age: 30
    }

    expect(predicate(entity)).toBe(true)
  })

  it("can be used in a bucket's derive function to create a derived bucket based on a query", () => {
    const bucket = new Bucket<{ name: string; age?: number }>()
    const predicate = query({ all: ["name", "age"], any: [], none: [] })
    const derived = bucket.derive(predicate)

    const entity = {
      name: "John",
      age: 30
    }

    expect(predicate(entity)).toBe(true)

    bucket.add(entity)

    expect(derived.has(entity)).toBe(true)
  })
})
