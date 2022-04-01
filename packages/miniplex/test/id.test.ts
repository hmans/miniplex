/*

Just a bunch of different usage scenarios around (optional) entity ID generation.

*/

import { v4 as uuidv4 } from "uuid"
import { World } from "../src"

type NumericalIDComponent = {
  id: number
}

type UUIDComponent = {
  id: string
}

type NameComponent = {
  name: string
}

const numericalIdGenerator = (start = 1) => {
  let nextId = start
  return () => nextId++
}

type EntityWithNumericalId = NumericalIDComponent & Partial<NameComponent>
type EntityWithUUID = UUIDComponent & Partial<NameComponent>

describe("adding IDs to entities", () => {
  it("can be done using a simple ID generator", () => {
    const nextId = numericalIdGenerator()

    const world = new World<EntityWithNumericalId>()
    const entity = world.createEntity({ id: nextId(), name: "Alice" })

    expect(entity.id).toEqual(1)
  })

  it("can be done using a component factory", () => {
    const nextId = numericalIdGenerator()

    const id = (): NumericalIDComponent => ({
      id: nextId()
    })

    const name = (name: string): NameComponent => ({
      name
    })

    const world = new World<EntityWithNumericalId>()
    const entity = world.createEntity({ ...id(), ...name("Alice") })

    expect(entity.id).toEqual(1)
  })

  it("also works with UUIds", () => {
    const world = new World<EntityWithUUID>()
    const entity = world.createEntity({ id: uuidv4(), name: "Alice" })
    expect(entity.id).toMatch(
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
    )
  })
})
