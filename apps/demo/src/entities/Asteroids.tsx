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

      {segmentedAsteroids.segments.map((segment, i) => (
        <ECS.Bucket key={i} bucket={segment} as={RenderableEntity} />
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

class Segments<E> {
  segments: Bucket<E>[] = []

  private entityToSegment = new Map<E, Bucket<E>>()

  get current() {
    return this.segments[this.segments.length - 1]
  }

  constructor(public source: Bucket<E>, public segmentSize = 50) {
    this.segments.push(new Bucket<E>())

    /* Transfer existing entities */
    for (const entity of source) {
      this.add(entity)
    }

    source.onEntityAdded.addListener((e) => {
      this.add(e)
    })

    source.onEntityRemoved.addListener((e) => {
      this.remove(e)
    })
  }

  add(entity: E) {
    this.current.add(entity)
    this.entityToSegment.set(entity, this.current)

    /* Create a new segment if we're over the limit */
    if (this.current.size >= this.segmentSize) {
      this.segments.push(new Bucket<E>())
    }
  }

  remove(entity: E) {
    const segment = this.entityToSegment.get(entity)
    if (segment) {
      segment.remove(entity)
      this.entityToSegment.delete(entity)
    }
  }
}

const asteroids = ECS.world.derive(isAsteroid)
const segmentedAsteroids = new Segments(asteroids)

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
