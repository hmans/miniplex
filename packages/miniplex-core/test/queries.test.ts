import { has, hasNone, hasSome, not } from "../src/queries"

describe(has, () => {
  it("returns true if the entity has all of the specified components", () => {
    expect(has("name", "age")({ name: "John", age: 123 })).toBe(true)
  })

  it("returns false if the entity does not have all of the specified components", () => {
    expect(has("name", "age")({ name: "John" })).toBe(false)
  })

  it("returns the same predicate for the same input values", () => {
    expect(has("name", "age")).toBe(has("name", "age"))
  })
})

describe(hasSome, () => {
  it("returns true if the entity has at least one of the specified components", () => {
    expect(hasSome("name", "age")({ name: "John" } as any)).toBe(true)
  })

  it("returns false if the entity has none of the specified components", () => {
    expect(hasSome("name", "age")({} as any)).toBe(false)
  })
})

describe(hasNone, () => {
  it("returns true if the entity has none of the specified components", () => {
    expect(hasNone("name", "age")({} as any)).toBe(true)
  })

  it("returns false if the entity has at least one of the specified components", () => {
    expect(hasNone("name", "age")({ name: "John" } as any)).toBe(false)
  })
})

describe(not, () => {
  it("negates the predicte", () => {
    expect(not(has("name", "age"))({ name: "John" } as any)).toBe(true)
  })
})
