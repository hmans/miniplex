import { With, World } from "./src"

const entityCount = 1_000_000

const profile = (name: string, setup: () => () => () => boolean) => {
  const test = setup()
  const before = performance.now()
  const assertion = test()
  const after = performance.now()

  /* Check assertion */
  if (!assertion()) {
    throw new Error("Assertion failed!")
  }

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
    for (let i = 0; i < entityCount; i++) {
      world.add({
        position: { x: 0, y: i, z: 0 },
        velocity: { x: 0, y: 0, z: 0 }
      })
    }

    return () => world.size === entityCount
  }
})

profile("add (with archetypes)", () => {
  const world = new World<Entity>()
  const withPosition = world.archetype("position")
  const withVelocity = world.archetype("velocity")

  return () => {
    for (let i = 0; i < entityCount; i++) {
      world.add({
        position: { x: 0, y: i, z: 0 },
        velocity: { x: 0, y: 0, z: 0 }
      })
    }

    return () => world.size === entityCount
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

    return () => world.size === 0
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

    return () =>
      world.size === 0 && withPosition.size === 0 && withVelocity.size === 0
  }
})

profile("clear", () => {
  const world = new World<Entity>()
  for (let i = 0; i < entityCount; i++)
    world.add({
      position: { x: 0, y: i, z: 0 },
      velocity: { x: 0, y: 0, z: 0 }
    })

  return () => {
    world.clear()

    return () => world.size === 0
  }
})

profile("clear (with archetypes)", () => {
  const world = new World<Entity>()
  const withPosition = world.archetype("position")
  const withVelocity = world.archetype("velocity")

  for (let i = 0; i < entityCount; i++)
    world.add({
      position: { x: 0, y: i, z: 0 },
      velocity: { x: 0, y: 0, z: 0 }
    })

  return () => {
    world.clear()

    return () =>
      world.size === 0 && withPosition.size === 0 && withVelocity.size === 0
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
    let i = 0
    for (const { position, velocity } of world) {
      i++
      if (!velocity) continue
      position.x += velocity.x
      position.y += velocity.y
      position.z += velocity.z
    }

    return () => i === entityCount
  }
})

profile("simulate (with archetypes)", () => {
  const world = new World<Entity>()
  const withVelocity = world.archetype<With<Entity, "velocity">>("velocity")

  for (let i = 0; i < entityCount; i++)
    world.add({
      position: { x: 0, y: i, z: 0 },
      velocity: { x: 1, y: 2, z: 3 }
    })

  return () => {
    let i = 0

    for (const { position, velocity } of withVelocity) {
      i++
      position.x += velocity.x
      position.y += velocity.y
      position.z += velocity.z
    }

    return () => i === entityCount
  }
})
