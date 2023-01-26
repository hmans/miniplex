import {
  hasAnyComponents,
  hasComponents,
  hasNoComponents
} from "../src/helpers"

describe(hasComponents, () => {
  it("should be true when all components are present", () => {
    expect(hasComponents({ a: 1, b: 2, c: 3 }, "a", "b")).toBe(true)
  })

  it("should be false when any component is missing", () => {
    expect(hasComponents({ a: 1, b: undefined }, "a", "b")).toBe(false)
  })
})

describe(hasAnyComponents, () => {
  it("should be true when any component is present", () => {
    expect(hasAnyComponents({ a: 1, b: undefined }, "a", "b")).toBe(true)
  })

  it("should be false when no component is present", () => {
    expect(hasAnyComponents({ a: undefined, b: undefined }, "a", "b")).toBe(
      false
    )
  })
})

describe(hasNoComponents, () => {
  it("should be true when no component is present", () => {
    expect(hasNoComponents({ a: undefined, b: undefined }, "a", "b")).toBe(true)
  })

  it("should be false when any component is present", () => {
    expect(hasNoComponents({ a: 1, b: undefined }, "a", "b")).toBe(false)
  })
})
