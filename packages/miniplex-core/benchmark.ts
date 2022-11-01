import { World } from "./src"
import chalk from "chalk"

const entityCount = 1_000_000

const heading = (text: string) => {
  console.log()
  console.log(chalk.bgCyanBright(` ${text} `))
  console.log()
}

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
    `${name.padStart(40)}  ${duration.toFixed(2).padStart(8)}ms ${ops
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

heading("Entity Addition")

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

heading("Entity Removal")

profile("remove (random)", () => {
  const world = new World<Entity>()
  for (let i = 0; i < entityCount; i++)
    world.add({
      position: { x: 0, y: i, z: 0 },
      velocity: { x: 0, y: 0, z: 0 }
    })

  return () => {
    while (world.size > 0) {
      /* Get a random entity... */
      const entity = world.entities[Math.floor(Math.random() * world.size)]

      /* ...and delete it */
      world.remove(entity)
    }

    return () => world.size === 0
  }
})

profile("remove (random, with archetypes)", () => {
  const world = new World<Entity>()
  const withPosition = world.archetype("position")
  const withVelocity = world.archetype("velocity")

  for (let i = 0; i < entityCount; i++)
    world.add({
      position: { x: 0, y: i, z: 0 },
      velocity: { x: 0, y: 0, z: 0 }
    })

  return () => {
    while (world.size > 0) {
      /* Get a random entity... */
      const entity = world.entities[Math.floor(Math.random() * world.size)]

      /* ...and delete it */
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

heading("Iteration")

profile("simulate (iterator)", () => {
  const world = new World<Entity>()

  for (let i = 0; i < entityCount; i++)
    world.add({
      position: { x: Math.random() * 200 - 100, y: i, z: 0 },
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

profile("simulate (iterator, archetypes)", () => {
  const world = new World<Entity>()
  const withVelocity = world.archetype("velocity")

  for (let i = 0; i < entityCount; i++)
    world.add({
      position: { x: Math.random() * 200 - 100, y: i, z: 0 },
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

profile("simulate (array 👎)", () => {
  const world = new World<Entity>()

  for (let i = 0; i < entityCount; i++)
    world.add({
      position: { x: Math.random() * 200 - 100, y: i, z: 0 },
      velocity: { x: 1, y: 2, z: 3 }
    })

  return () => {
    let i = 0
    for (const { position, velocity } of world.entities) {
      i++
      if (!velocity) continue
      position.x += velocity.x
      position.y += velocity.y
      position.z += velocity.z
    }

    return () => i === entityCount
  }
})

heading("Iteration with predicates")

profile("value predicate check (where)", () => {
  const world = new World<Entity>()

  for (let i = 0; i < entityCount; i++)
    world.add({
      position: { x: Math.random() * 200 - 100, y: i, z: 0 },
      velocity: { x: 1, y: 2, z: 3 }
    })

  return () => {
    let i = 0

    for (const { position, velocity } of world.where((e) => e.position.x > 0)) {
      i++
      if (!velocity) continue
      position.x += velocity.x
      position.y += velocity.y
      position.z += velocity.z
    }

    return () => i > 0
  }
})

profile("value predicate check (filter 👎)", () => {
  const world = new World<Entity>()

  for (let i = 0; i < entityCount; i++)
    world.add({
      position: { x: Math.random() * 200 - 100, y: i, z: 0 },
      velocity: { x: 1, y: 2, z: 3 }
    })

  return () => {
    let i = 0

    for (const { position, velocity } of world.entities.filter(
      (e) => e.position.x > 0
    )) {
      i++
      if (!velocity) continue
      position.x += velocity.x
      position.y += velocity.y
      position.z += velocity.z
    }

    return () => i > 0
  }
})
