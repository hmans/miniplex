import { memoizedMap } from "./memoizedMap"

describe(memoizedMap, () => {
  it("memoizes things by key :)", () => {
    const map = memoizedMap()

    const value = {}
    map.fetch("foo", () => value)
    expect(map.fetch("foo")).toBe(value)
  })
})
