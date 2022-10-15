import { WithRequiredKeys } from "miniplex"
import { between, plusMinus } from "randomish"
import { useLayoutEffect } from "react"
import { Quaternion, Vector3 } from "three"
import { InstancedParticles, Particle, ParticleProps } from "vfx-composer-r3f"
import { ECS, Entity, physics } from "../state"

const RenderableEntity = ({
  entity
}: {
  entity: WithRequiredKeys<Entity, "render">
}) => <>{entity.render}</>

export const Asteroids = () => {
  useLayoutEffect(() => {
    for (let i = 0; i < 100; i++) {
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
      <icosahedronGeometry />
      <meshStandardMaterial color="#888" />

      <ECS.Bucket bucket={asteroids} as={RenderableEntity} />
    </InstancedParticles>
  )
}

export type Asteroid = WithRequiredKeys<
  Entity,
  | "isAsteroid"
  | "transform"
  | "physics"
  | "spatialHashing"
  | "neighbors"
  | "render"
>

export const isAsteroid = (entity: Entity): entity is Asteroid =>
  "isAsteroid" in entity

const asteroids = ECS.world.derive(isAsteroid)

const tmpVec3 = new Vector3()

export const spawnAsteroid = (props: ParticleProps) => {
  const scale = between(0.8, 1)

  const entity = ECS.world.add({
    isAsteroid: true,
    physics: physics({
      radius: scale * 0.9,
      restitution: 0.1,
      onContactStart: (other, force) => {
        entity.physics!.angularVelocity.add(
          tmpVec3.randomDirection().multiplyScalar(force / 30)
        )
      }
    }),
    spatialHashing: {},
    neighbors: [],

    render: (
      <ECS.Property name="transform">
        <Particle
          {...props}
          scale={scale}
          quaternion={new Quaternion().random()}
        />
      </ECS.Property>
    )
  })

  return entity
}
