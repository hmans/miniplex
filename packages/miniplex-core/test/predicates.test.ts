import { all, IEntity, none, not } from "../src"

describe("not", () => {
  it("invertes the given predicate", () => {
    const p = (entity: IEntity) => true
    const entity = {}
    const a = not(p)
    expect(p(entity)).toBe(true)
    expect(a(entity)).toBe(false)
  })

  it("memoizes the returned predicate", () => {
    const p = (entity: IEntity) => true
    const a = not(p)
    const b = not(p)
    expect(a === b).toBeTruthy()
  })
})

describe("all", () => {
  it("returns true if all components are present", () => {
    const p = all("a", "b")
    const entity = { a: 1, b: 2 }
    expect(p(entity)).toBe(true)
  })

  it("returns false if any component is missing", () => {
    const p = all("a", "b")
    const entity = { a: 1 }
    expect(p(entity)).toBe(false)
  })

  it("memoizes the returned predicate", () => {
    const a = all("a", "", "b")
    const b = all("a", "a", "", "b")
    expect(a === b).toBeTruthy()
  })
})

describe("none", () => {
  it("returns true if all components are missing", () => {
    const p = none("a", "b")
    const entity = {}
    expect(p(entity)).toBe(true)
  })

  it("returns false if any component is present", () => {
    const p = none("a", "b")
    const entity = { a: 1 }
    expect(p(entity)).toBe(false)
  })

  it("memoizes the returned predicate", () => {
    const a = none("a", "b")
    const b = none("b", "a", "")
    expect(a === b).toBeTruthy()
  })
})
