import { archetype, Bucket } from "miniplex"
import { between } from "randomish"
import { useEffect } from "react"
import { Vector3 } from "three"
import { Asteroid, spawnAsteroid } from "../entities/Asteroids"
import { ECS } from "../state"

const asteroids = ECS.world.where(archetype("isAsteroid")) as Bucket<Asteroid>
const destroyedAsteroids = asteroids.where(archetype("destroy"))

export const AsteroidsSystem = () => {
  /* Every time a new destroyed asteroid "appears", spawn some new ones! */
  useEffect(() =>
    destroyedAsteroids.onEntityAdded.add((entity) => {
      const scale = entity.transform.scale.x
      if (scale > 0.8) {
        const count = between(3, 10)
        for (let i = 0; i < count; i++) {
          const direction = new Vector3(
            Math.cos(((2 * Math.PI) / count) * i),
            Math.sin(((2 * Math.PI) / count) * i),
            0
          )

          const asteroid = spawnAsteroid(
            {
              position: new Vector3()
                .copy(direction)
                .add(entity.transform!.position)
            },
            scale * between(0.5, 0.9)
          )

          asteroid.physics!.velocity = direction.clone().multiplyScalar(15)
        }
      }
    })
  )

  return null
}
