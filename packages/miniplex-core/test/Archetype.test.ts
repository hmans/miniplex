import { Archetype, World } from "../src"

type Entity = {
  name: string
  age?: number
  height?: number
}

describe(Archetype, () => {
  it("creates an archetype bucket containg all entities that have a specific set of components", () => {
    const world = new World<Entity>()
    const archetype = new Archetype(world, { all: ["age", "name"] })

    const john = world.add({ name: "John" })
    const jane = world.add({ name: "Jane", age: 123 })

    expect(archetype.entities).toEqual([jane])
  })

  it("creates an archetype bucket containing all entities that have at least one of the specified components", () => {
    const world = new World<Entity>()
    const archetype = new Archetype(world, { any: ["age", "height"] })

    const john = world.add({ name: "John" })
    const jane = world.add({ name: "Jane", age: 123 })
    const jack = world.add({ name: "Jack", height: 123 })

    expect(archetype.entities).toEqual([jane, jack])
  })

  it("creates an archetype bucket containing all entities that have none of the specified components", () => {
    const world = new World<Entity>()
    const archetype = new Archetype(world, { none: ["age", "height"] })

    const john = world.add({ name: "John" })
    const jane = world.add({ name: "Jane", age: 123 })
    const jack = world.add({ name: "Jack", height: 123 })

    expect(archetype.entities).toEqual([john])
  })
})
