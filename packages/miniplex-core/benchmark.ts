import { World } from "./src"

const entityCount = 1_000_000

const profile = (name: string, setup: () => () => void) => {
  const test = setup()
  const before = performance.now()
  test()
  const after = performance.now()

  /* Results */
  const duration = after - before
  const ops = entityCount / (after - before)

  console.log(
    `${name.padStart(30)}  ${duration.toFixed(2).padStart(8)}ms ${ops
      .toFixed(1)
      .padStart(10)} ops/ms`
  )
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

console.log(`Entity count: ${entityCount}\n`)

profile("add", () => {
  const world = new World<Entity>()

  return () => {
    for (let i = 0; i < entityCount; i++)
      world.add({
        position: { x: 0, y: i, z: 0 },
        velocity: { x: 0, y: 0, z: 0 }
      })
  }
})

profile("add (with archetypes)", () => {
  const world = new World<Entity>()
  const withPosition = world.archetype("position")
  const withVelocity = world.archetype("velocity")

  return () => {
    for (let i = 0; i < entityCount; i++)
      world.add({
        position: { x: 0, y: i, z: 0 },
        velocity: { x: 0, y: 0, z: 0 }
      })
  }
})

profile("remove", () => {
  const world = new World<Entity>()
  for (let i = 0; i < entityCount; i++)
    world.add({
      position: { x: 0, y: i, z: 0 },
      velocity: { x: 0, y: 0, z: 0 }
    })

  return () => {
    for (const entity of world) {
      world.remove(entity)
    }

    if (world.size > 0)
      throw new Error("World not empty, reverse iteration is leaky")
  }
})

profile("remove (with archetypes)", () => {
  const world = new World<Entity>()
  const withPosition = world.archetype("position")
  const withVelocity = world.archetype("velocity")

  for (let i = 0; i < entityCount; i++)
    world.add({
      position: { x: 0, y: i, z: 0 },
      velocity: { x: 0, y: 0, z: 0 }
    })

  return () => {
    for (const entity of world) {
      world.remove(entity)
    }

    if (world.size > 0)
      throw new Error("World not empty, reverse iteration is leaky")
  }
})

profile("simulate", () => {
  const world = new World<Entity>()

  for (let i = 0; i < entityCount; i++)
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

profile("simulate (with archetypes)", () => {
  const world = new World<Entity>()
  const withPosition = world.archetype("position")
  const withVelocity = world.archetype("velocity")

  for (let i = 0; i < entityCount; i++)
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
