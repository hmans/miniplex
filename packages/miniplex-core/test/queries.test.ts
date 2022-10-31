import { World } from "../src"
import { archetype, getArchetype, not } from "../src/queries"

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
        with: ["name", "age"]
      })(entity)
    ).toBe(true)

    expect(
      archetype({
        with: ["health"]
      })(entity)
    ).toBe(false)

    expect(
      archetype({
        with: ["name"],
        without: ["age"]
      })(entity)
    ).toBe(false)
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
        with: ["name", "age"]
      })
    ).not.toBe(
      archetype({
        with: ["name"]
      })
    )
  })

  it("returns the same predicate for the same query (with normalization)", () => {
    expect(
      archetype({
        with: ["name", undefined!, "age"],
        without: ["health", undefined!]
      })
    ).toBe(
      archetype({
        with: ["age", "name"],
        without: ["health"]
      })
    )
  })
})

describe(getArchetype, () => {
  type Entity = { name: string; age?: number; height?: number }

  it("returns entities of the given type", () => {
    const world = new World<Entity>()
    const withAge = getArchetype(world, "age")
    const john = world.add({ name: "John", age: 123 })
    const jane = world.add({ name: "Jane" })

    expect(withAge.entities).toEqual([john])
  })
})
