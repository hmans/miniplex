import { plusMinus } from "randomish"
import { useLayoutEffect } from "react"
import { InstancedParticles, Particle, ParticleProps } from "vfx-composer-r3f"
import { ECS, physics } from "../state"

export const Asteroids = () => {
  useLayoutEffect(() => {
    for (let i = 0; i < 20; i++) {
      spawnAsteroid({ position: [plusMinus(9), plusMinus(9), 0] })
    }

    return () => {
      for (const asteroid of ECS.world.archetype("isAsteroid")) {
        ECS.world.remove(asteroid)
      }
    }
  }, [])

  return (
    <InstancedParticles>
      <icosahedronGeometry args={[0.5]} />
      <meshStandardMaterial color="#888" />

      <ECS.Archetype properties="isAsteroid">
        {(entity) => entity.jsx}
      </ECS.Archetype>
    </InstancedParticles>
  )
}

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
