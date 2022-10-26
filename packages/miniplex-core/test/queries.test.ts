import { matches } from "../src/queries"

describe("matches", () => {
  type Entity = {
    name: string
    age?: number
    height?: number
  }

  const entity: Entity = { name: "John", age: 42 }

  it("returns true if 'all' components are present", () => {
    expect(matches(entity, { all: ["name", "age"] })).toBe(true)
  })

  it("returns false if any 'all' component is missing", () => {
    expect(matches(entity, { all: ["name", "age", "height"] })).toBe(false)
  })

  it("returns true if any 'any' component is present", () => {
    expect(matches(entity, { any: ["name", "height"] })).toBe(true)
  })

  it("returns false if all 'any' components are missing", () => {
    expect(matches(entity, { any: ["height"] })).toBe(false)
  })

  it("returns true if no 'none' components are present", () => {
    expect(matches(entity, { none: ["height"] })).toBe(true)
  })

  it("returns false if any 'none' component is present", () => {
    expect(matches(entity, { none: ["name", "height"] })).toBe(false)
  })
})
