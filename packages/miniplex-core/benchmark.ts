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
    `${name.padStart(50)}  ${duration.toFixed(2).padStart(8)}ms ${ops
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
  const withPosition = world.with("position")
  const withVelocity = world.with("velocity")

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
  const withPosition = world.with("position")
  const withVelocity = world.with("velocity")

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
  const withPosition = world.with("position")
  const withVelocity = world.with("velocity")

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
  const withVelocity = world.with("velocity")

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

heading("ooflorent's packed_5")

profile("1000x for entity of 1000 entities", () => {
  const ecs = new World()

  for (let i = 0; i < 1000; i++) {
    ecs.add({ A: 1, B: 1, C: 1, D: 1, E: 1 })
  }

  const withA = ecs.with("A")
  const withB = ecs.with("B")
  const withC = ecs.with("C")
  const withD = ecs.with("D")
  const withE = ecs.with("E")

  return () => {
    for (let i = 0; i < 1000; i++) {
      for (const entity of withA.entities) entity.A *= 2
      for (const entity of withB.entities) entity.B *= 2
      for (const entity of withC.entities) entity.C *= 2
      for (const entity of withD.entities) entity.D *= 2
      for (const entity of withE.entities) entity.E *= 2
    }

    return () => true
  }
})

profile("1000x iterating over iterator with 1000 entities", () => {
  const ecs = new World()

  for (let i = 0; i < 1000; i++) {
    ecs.add({ A: 1, B: 1, C: 1, D: 1, E: 1 })
  }

  const withA = ecs.with("A")
  const withB = ecs.with("B")
  const withC = ecs.with("C")
  const withD = ecs.with("D")
  const withE = ecs.with("E")

  return () => {
    for (let i = 0; i < 1000; i++) {
      for (const entity of withA) entity.A *= 2
      for (const entity of withB) entity.B *= 2
      for (const entity of withC) entity.C *= 2
      for (const entity of withD) entity.D *= 2
      for (const entity of withE) entity.E *= 2
    }

    return () => true
  }
})

profile("1x iterating over array of 1m entities", () => {
  const ecs = new World()

  for (let i = 0; i < entityCount; i++) {
    ecs.add({ A: 1, B: 1, C: 1, D: 1, E: 1 })
  }

  const withA = ecs.with("A")
  const withB = ecs.with("B")
  const withC = ecs.with("C")
  const withD = ecs.with("D")
  const withE = ecs.with("E")

  return () => {
    for (const entity of withA.entities) entity.A *= 2
    for (const entity of withB.entities) entity.B *= 2
    for (const entity of withC.entities) entity.C *= 2
    for (const entity of withD.entities) entity.D *= 2
    for (const entity of withE.entities) entity.E *= 2

    return () => true
  }
})

profile("1x iterating over iterator with 1m entities", () => {
  const ecs = new World()

  for (let i = 0; i < entityCount; i++) {
    ecs.add({ A: 1, B: 1, C: 1, D: 1, E: 1 })
  }

  const withA = ecs.with("A")
  const withB = ecs.with("B")
  const withC = ecs.with("C")
  const withD = ecs.with("D")
  const withE = ecs.with("E")

  return () => {
    for (const entity of withA) entity.A *= 2
    for (const entity of withB) entity.B *= 2
    for (const entity of withC) entity.C *= 2
    for (const entity of withD) entity.D *= 2
    for (const entity of withE) entity.E *= 2

    return () => true
  }
})

profile("1x for index of 1m entities", () => {
  const ecs = new World()

  for (let i = 0; i < entityCount; i++) {
    ecs.add({ A: 1, B: 1, C: 1, D: 1, E: 1 })
  }

  const withA = ecs.with("A")
  const withB = ecs.with("B")
  const withC = ecs.with("C")
  const withD = ecs.with("D")
  const withE = ecs.with("E")

  return () => {
    for (let i = 0; i < withA.size; i++) withA.entities[i].A *= 2
    for (let i = 0; i < withB.size; i++) withB.entities[i].B *= 2
    for (let i = 0; i < withC.size; i++) withC.entities[i].C *= 2
    for (let i = 0; i < withD.size; i++) withD.entities[i].D *= 2
    for (let i = 0; i < withE.size; i++) withE.entities[i].E *= 2

    return () => true
  }
})

profile("1x for index of 1m entities (cached length)", () => {
  const ecs = new World()

  for (let i = 0; i < entityCount; i++) {
    ecs.add({ A: 1, B: 1, C: 1, D: 1, E: 1 })
  }

  const withA = ecs.with("A")
  const withB = ecs.with("B")
  const withC = ecs.with("C")
  const withD = ecs.with("D")
  const withE = ecs.with("E")

  return () => {
    const withASize = withA.size
    const withBSize = withB.size
    const withCSize = withC.size
    const withDSize = withD.size
    const withESize = withE.size

    for (let i = 0; i < withASize; i++) withA.entities[i].A *= 2
    for (let i = 0; i < withBSize; i++) withB.entities[i].B *= 2
    for (let i = 0; i < withCSize; i++) withC.entities[i].C *= 2
    for (let i = 0; i < withDSize; i++) withD.entities[i].D *= 2
    for (let i = 0; i < withESize; i++) withE.entities[i].E *= 2

    return () => true
  }
})
