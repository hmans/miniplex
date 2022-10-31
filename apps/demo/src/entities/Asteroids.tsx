import { Composable, Modules } from "material-composer-r3f"
import { archetype, With } from "miniplex"
import { insideCircle, power } from "randomish"
import { useLayoutEffect } from "react"
import { $, Input, InstanceID, Lerp } from "shader-composer"
import { Random } from "shader-composer-toybox"
import { Color, Quaternion, Vector3 } from "three"
import { InstancedParticles, Particle, ParticleProps } from "vfx-composer-r3f"
import { useSegmentedBucket } from "../lib/SegmentedBucket"
import { ECS, Entity, physics, PhysicsLayers } from "../state"
import { bitmask } from "../util/bitmask"
import { RenderableEntity } from "./RenderableEntity"

export type Asteroid = With<
  Entity,
  | "isAsteroid"
  | "transform"
  | "physics"
  | "spatialHashing"
  | "neighbors"
  | "render"
>

const asteroids = ECS.world.where<Asteroid>(archetype("isAsteroid"))

export const InstanceRNG =
  ({ seed }: { seed?: Input<"float"> } = {}) =>
  (offset: Input<"float"> = Math.random() * 10) =>
    Random($`${offset} + float(${InstanceID}) * 1.1005`)

export const Asteroids = () => {
  const segmentedAsteroids = useSegmentedBucket(asteroids)

  console.log("Rerendering Asteroids component. You should only see this once.")

  useLayoutEffect(() => {
    for (let i = 0; i < 1000; i++) {
      const pos = insideCircle(100)
      spawnAsteroid({ position: [pos.x, pos.y, 0] })
    }

    return () => {
      for (const asteroid of asteroids) {
        ECS.world.remove(asteroid)
      }
    }
  }, [])

  const rand = InstanceRNG()

  return (
    <InstancedParticles capacity={20000}>
      <icosahedronGeometry />

      <Composable.MeshStandardMaterial>
        <Modules.Color
          color={Lerp(new Color("#666"), new Color("#888"), rand(12))}
        />
      </Composable.MeshStandardMaterial>

      {segmentedAsteroids.entities.map((segment, i) => (
        <ECS.Entities key={i} in={segment} as={RenderableEntity} />
      ))}

      {/* <ECS.Entities bucket={asteroids} as={RenderableEntity} /> */}
    </InstancedParticles>
  )
}

const tmpVec3 = new Vector3()

export const spawnAsteroid = (
  props: ParticleProps,
  scale = 1 + power(2) * 1
) => {
  const entity = ECS.world.add({
    isAsteroid: true,

    health: 1000 * scale,

    physics: physics({
      radius: scale * 0.8,
      restitution: 0.1,
      mass: 40 * scale,

      groupMask: bitmask(PhysicsLayers.Asteroid),
      collisionMask: bitmask([
        PhysicsLayers.Player,
        PhysicsLayers.Bullet,
        PhysicsLayers.Asteroid
      ]),

      onContactStart: (other, force) => {
        entity.physics!.angularVelocity.add(
          tmpVec3.randomDirection().multiplyScalar(force / 500)
        )
      }
    }),

    spatialHashing: true,
    neighbors: [],

    render: (
      <ECS.Component name="transform">
        <Particle
          {...props}
          scale={scale}
          quaternion={new Quaternion().random()}
        />
      </ECS.Component>
    )
  })

  return entity as Asteroid
}
