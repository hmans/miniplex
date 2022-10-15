import { World } from "./src"

const count = 100_000

const profile = <T>(name: string, fn: () => T) => {
  const before = Date.now()
  const result = fn()
  const after = Date.now()
  console.log(`${name} took ${after - before}ms`)
  return result
}

type Entity = {
  position: {
    x: number
    y: number
    z: number
  }
  age?: number
}

const world = new World<Entity>()

const createEntities = () => {
  for (let i = 0; i < count; i++)
    world.add({ position: { x: 0, y: i, z: 0 }, age: i })
}

profile("create", createEntities)
