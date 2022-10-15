import { World } from "./src"

const count = 1_000_000

const profile = (name: string, setup: () => () => void) => {
  const test = setup()
  const before = performance.now()
  test()
  const after = performance.now()
  const duration = (after - before).toFixed(2)
  console.log(`[${name}] ${duration}ms`)
}

type Vector = {
  x: number
  y: number
  z: number
}

type Entity = {
  position: Vector
  velocity?: Vector
}

profile("adding without archetypes", () => {
  const world = new World<Entity>()

  return () => {
    for (let i = 0; i < count; i++)
      world.add({ position: { x: 0, y: i, z: 0 } })
  }
})

profile("adding with archetypes", () => {
  const world = new World<Entity>()
  const withPosition = world.archetype("position")
  const withVelocity = world.archetype("velocity")

  return () => {
    for (let i = 0; i < count; i++)
      world.add({ position: { x: 0, y: i, z: 0 } })
  }
})

profile("simulate without archetype", () => {
  const world = new World<Entity>()

  for (let i = 0; i < count; i++)
    world.add({
      position: { x: 0, y: i, z: 0 },
      velocity: { x: 1, y: 2, z: 3 }
    })

  return () => {
    for (const { position, velocity } of world) {
      if (!velocity) continue
      position.x += velocity.x
      position.y += velocity.y
      position.z += velocity.z
    }
  }
})

profile("simulate with archetype", () => {
  const world = new World<Entity>()
  const withVelocity = world.archetype("velocity")

  for (let i = 0; i < count; i++)
    world.add({
      position: { x: 0, y: i, z: 0 },
      velocity: { x: 1, y: 2, z: 3 }
    })

  return () => {
    for (const { position, velocity } of withVelocity) {
      position.x += velocity.x
      position.y += velocity.y
      position.z += velocity.z
    }
  }
})
