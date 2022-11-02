import { useOnEntityAdded } from "miniplex/react"
import { between } from "randomish"
import { Vector3 } from "three"
import { spawnAsteroid } from "../entities/Asteroids"
import { Asteroid, ECS } from "../state"

/* Query by archetype, supply custom type of resulting entities */
const asteroids = ECS.world.with<Asteroid>("isAsteroid")

/* Nest queries to get more specific results */
const destroyedAsteroids = asteroids.with("destroy")

export const AsteroidsSystem = () => {
  /* Every time a new destroyed asteroid "appears", spawn some new ones! */
  useOnEntityAdded(destroyedAsteroids, explodeAsteroidIntoChunks)

  return null
}

function explodeAsteroidIntoChunks(entity: Asteroid) {
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
}
