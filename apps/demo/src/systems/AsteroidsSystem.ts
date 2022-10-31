import { archetype } from "miniplex"
import { useOnEntityAdded } from "miniplex/react"
import { between } from "randomish"
import { Vector3 } from "three"
import { Asteroid, spawnAsteroid } from "../entities/Asteroids"
import { ECS } from "../state"

/* Query by archetype, supply custom type of resulting entities */
const asteroids = ECS.world.where<Asteroid>(archetype("isAsteroid"))

/* Nest queries to get more specific results */
const destroyedAsteroids = asteroids.where(archetype("destroy"))

export const AsteroidsSystem = () => {
  /* Every time a new destroyed asteroid "appears", spawn some new ones! */
  useOnEntityAdded(destroyedAsteroids, (entity) => {
    const scale = entity.transform.scale.x

    if (scale < 0.8) return

    const count = between(3, 10)

    for (let i = 0; i < count; i++) {
      const direction = new Vector3(
        Math.cos(((2 * Math.PI) / count) * i),
        Math.sin(((2 * Math.PI) / count) * i),
        0
      )

      const position = new Vector3()
        .copy(direction)
        .add(entity.transform.position)

      const asteroid = spawnAsteroid({ position }, scale * between(0.5, 0.9))

      asteroid.physics.velocity = direction.clone().multiplyScalar(15)
    }
  })

  return null
}
