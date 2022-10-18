import { id } from "@hmans/id"
import { Composable, Modules } from "material-composer-r3f"
import { Bucket, WithRequiredKeys } from "miniplex"
import { insideCircle, power } from "randomish"
import { useLayoutEffect } from "react"
import { $, Input, InstanceID, Lerp } from "shader-composer"
import { Random } from "shader-composer-toybox"
import { Color, Quaternion, Vector3 } from "three"
import { InstancedParticles, Particle, ParticleProps } from "vfx-composer-r3f"
import { ECS, Entity, physics, PhysicsLayers } from "../state"
import { bitmask } from "../util/bitmask"
import { RenderableEntity } from "./RenderableEntity"

export const InstanceRNG =
  ({ seed }: { seed?: Input<"float"> } = {}) =>
  (offset: Input<"float"> = Math.random() * 10) =>
    Random($`${offset} + float(${InstanceID}) * 1.1005`)

export const Asteroids = () => {
  useLayoutEffect(() => {
    for (let i = 0; i < 1; i++) {
      const pos = insideCircle(10)
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

      {segmentedAsteroids.map((bucket, i) => (
        <ECS.Bucket key={i} bucket={bucket} as={RenderableEntity} />
      ))}
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

const segment = <E,>(bucket: Bucket<E>, count = 2) =>
  new Array(count)
    .fill(0)
    .map((_, i) => bucket.derive((e) => id(e) % count === i))

const asteroids = ECS.world.derive(isAsteroid)
const segmentedAsteroids = segment(asteroids, 10)

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

  return entity
}
