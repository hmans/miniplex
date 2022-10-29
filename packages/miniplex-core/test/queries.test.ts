import { archetype, not } from "../src/queries"

describe(not, () => {
  it("negates the predicte", () => {
    expect(not(archetype("name", "age"))({ name: "John" } as any)).toBe(true)
  })

  it("always returns the same predicate for the given input predicate", () => {
    expect(not(archetype("name", "age"))).toBe(not(archetype("name", "age")))
  })
})

describe(archetype, () => {
  it("returns a predicate that checks if an entity belongs to the specified archetype", () => {
    const entity = {
      name: "John",
      age: 123
    }

    expect(
      archetype({
        all: ["name", "age"]
      })(entity)
    ).toBe(true)

    expect(
      archetype({
        all: ["health"]
      })(entity)
    ).toBe(false)

    expect(
      archetype({
        all: ["name"],
        none: ["age"]
      })(entity)
    ).toBe(false)

    expect(
      archetype({
        any: ["name", "height"]
      })(entity)
    ).toBe(true)
  })

  it("provides a short form that allows you to just pass a number of component names", () => {
    const entity = {
      name: "John",
      age: 123
    }

    expect(archetype("name", "age")(entity)).toBe(true)
    expect(archetype("health")(entity)).toBe(false)
  })

  it("returns different predicates for different queries", () => {
    expect(
      archetype({
        all: ["name", "age"]
      })
    ).not.toBe(
      archetype({
        all: ["name"]
      })
    )
  })

  it("returns the same predicate for the same query (with normalization)", () => {
    expect(
      archetype({
        all: ["name", undefined!, "age"],
        any: ["health", undefined!]
      })
    ).toBe(
      archetype({
        all: ["age", "name"],
        any: ["health"]
      })
    )
  })
})
