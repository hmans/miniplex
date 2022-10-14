import { plusMinus } from "randomish"
import { useLayoutEffect } from "react"
import { InstancedParticles, Particle, ParticleProps } from "vfx-composer-r3f"
import { ECS, physics, Entity } from "../state"

export const Asteroids = () => {
  useLayoutEffect(() => {
    for (let i = 0; i < 20; i++) {
      spawnAsteroid({ position: [plusMinus(9), plusMinus(9), 0] })
    }

    return () => {
      for (const asteroid of asteroids) {
        ECS.world.remove(asteroid)
      }
    }
  }, [])

  return (
    <InstancedParticles>
      <icosahedronGeometry args={[0.5]} />
      <meshStandardMaterial color="#888" />

      <ECS.Bucket bucket={asteroids}>{(entity) => entity.jsx}</ECS.Bucket>
    </InstancedParticles>
  )
}

export type Asteroid = Entity & ReturnType<typeof spawnAsteroid>

export const isAsteroid = (entity: Entity): entity is Asteroid =>
  "isAsteroid" in entity

const asteroids = ECS.world.derive(isAsteroid)

export const spawnAsteroid = (props: ParticleProps) => {
  const entity = ECS.world.add({
    isAsteroid: true,
    physics: physics({ radius: 0.4, restitution: 0.1 }),
    spatialHashing: {},
    neighbors: [],

    jsx: (
      <ECS.Property name="transform">
        <Particle {...props} />
      </ECS.Property>
    )
  })

  return entity
}
