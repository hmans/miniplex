import { Archetype, Query, World } from "../src"

type Entity = {
  name: string
  age?: number
  height?: number
}

describe(Archetype, () => {
  it("creates an archetype index containg all entities that have a specific set of components", () => {
    const world = new World<Entity>()
    const archetype = new Archetype(world, { all: ["age"] })

    world.add({ name: "John" })
    world.add({ name: "Jane", age: 123 })
    expect(archetype.entities).toEqual([{ name: "Jane", age: 123 }])
  })
})
