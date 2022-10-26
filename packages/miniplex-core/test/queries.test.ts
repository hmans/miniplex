import { normalizeComponents, normalizeQuery } from "../src/queries"

describe("normalizeComponents", () => {
  it("sorts the given list of components alphabetically", () => {
    expect(normalizeComponents(["b", "a"])).toEqual(["a", "b"])
  })

  it("removes duplicates", () => {
    expect(normalizeComponents(["a", "a"])).toEqual(["a"])
  })

  it("removes empty strings", () => {
    expect(normalizeComponents(["a", ""])).toEqual(["a"])
  })

  it("removes falsy values", () => {
    expect(normalizeComponents(["a", undefined!])).toEqual(["a"])
  })
})

describe("normalizeQuery", () => {
  it("normalizes the 'all' components", () => {
    expect(normalizeQuery({ all: ["b", "a"] })).toEqual({ all: ["a", "b"] })
  })

  it("normalizes the 'any' components", () => {
    expect(normalizeQuery({ any: ["b", "a"] })).toEqual({ any: ["a", "b"] })
  })

  it("normalizes the 'none' components", () => {
    expect(normalizeQuery({ none: ["b", "a"] })).toEqual({ none: ["a", "b"] })
  })

  it("does everything at once, too!", () => {
    expect(
      normalizeQuery({
        all: ["b", undefined!, "a"],
        any: ["d", "c", "c"],
        none: ["f", "e", null!]
      })
    ).toEqual({
      all: ["a", "b"],
      any: ["c", "d"],
      none: ["e", "f"]
    })
  })
})
