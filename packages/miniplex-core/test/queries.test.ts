import { componentsMatch, entityMatches } from "../src/queries"

describe("entityMatches", () => {
  type Entity = {
    name: string
    age?: number
    height?: number
  }

  const entity: Entity = { name: "John", age: 42 }

  it("returns true if 'all' components are present", () => {
    expect(entityMatches(entity, { all: ["name", "age"] })).toBe(true)
  })

  it("returns false if any 'all' component is missing", () => {
    expect(entityMatches(entity, { all: ["name", "age", "height"] })).toBe(
      false
    )
  })

  it("returns true if any 'any' component is present", () => {
    expect(entityMatches(entity, { any: ["name", "height"] })).toBe(true)
  })

  it("returns false if all 'any' components are missing", () => {
    expect(entityMatches(entity, { any: ["height"] })).toBe(false)
  })

  it("returns true if no 'none' components are present", () => {
    expect(entityMatches(entity, { none: ["height"] })).toBe(true)
  })

  it("returns false if any 'none' component is present", () => {
    expect(entityMatches(entity, { none: ["name", "height"] })).toBe(false)
  })
})

describe("componentsMatch", () => {
  type Entity = {
    name: string
    age?: number
    height?: number
  }

  const components: (keyof Entity)[] = ["name", "age"]

  it("returns true if 'all' components are present", () => {
    expect(componentsMatch(components, { all: ["name", "age"] })).toBe(true)
  })

  it("returns false if any 'all' component is missing", () => {
    expect(
      componentsMatch(components, { all: ["name", "age", "height"] })
    ).toBe(false)
  })

  it("returns true if any 'any' component is present", () => {
    expect(componentsMatch(components, { any: ["name", "height"] })).toBe(true)
  })

  it("returns false if all 'any' components are missing", () => {
    expect(componentsMatch(components, { any: ["height"] })).toBe(false)
  })

  it("returns true if no 'none' components are present", () => {
    expect(componentsMatch(components, { none: ["height"] })).toBe(true)
  })

  it("returns false if any 'none' component is present", () => {
    expect(componentsMatch(components, { none: ["name", "height"] })).toBe(
      false
    )
  })
})
