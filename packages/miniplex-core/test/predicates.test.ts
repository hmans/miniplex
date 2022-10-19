import { IEntity, not } from "../src"

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
    const entity = {}
    const a = not(p)
    const b = not(p)
    expect(a(entity)).toBe(false)
    expect(b(entity)).toBe(false)
    expect(a === b).toBeTruthy()
  })
})
