import { id } from "../src"

describe("id", () => {
  it("returns a stable numerical ID for the specified object", () => {
    const object = {}
    expect(id(object)).toBe(0)
    expect(id(object)).toBe(0) /* stable */
  })

  it("returns the same ID for the same object", () => {
    const object = {}
    expect(id(object)).toBe(id(object))
  })

  it("returns a different ID for different entities", () => {
    const object1 = {}
    const object2 = {}
    expect(id(object1)).not.toBe(id(object2))
  })
})
