import { createQueue } from "@hmans/queue"
import { World } from "miniplex"
import { createComponents } from "miniplex/react"
import { ReactNode } from "react"
import { Object3D, Vector3 } from "three"

export const BOUNDS = 10

export const PhysicsLayers = {
  Player: 1,
  Asteroid: 2,
  Bullet: 3
}

export type Entity = {
  isPlayer?: true
  isAsteroid?: true
  isBullet?: true

  transform?: Object3D
  destroy?: true

  /* When set, this entity will be subjected to spatial hashing system. */
  spatialHashing?: {
    currentCell?: Entity[]
  }

  /* When set, a system will fill this array with the entity's neighbors, using
  the spatial hashing data. */
  neighbors?: Entity[]

  /* Simulate physics. */
  physics?: {
    velocity: Vector3
    angularVelocity: Vector3
    linearDamping: number
    angularDamping: number
    mass: number
    radius: number
    restitution: number
    groupMask: number
    collisionMask: number
    contacts: Set<Entity>
    onContactStart?: (other: Entity, force: number) => void
    onContactEnd?: (other: Entity) => void
  }

  render?: ReactNode
}

/* A constructor for physics data. */
export const physics = (
  input: Partial<Entity["physics"]> = {}
): Entity["physics"] => ({
  velocity: new Vector3(0, 0, 0),
  angularVelocity: new Vector3(0, 0, 0),
  linearDamping: 0.99,
  angularDamping: 0.99,
  mass: 1,
  radius: 1,
  restitution: 0.5,
  groupMask: 0b1111_1111_1111_1111,
  collisionMask: 0b1111_1111_1111_1111,
  contacts: new Set(),
  ...input
})

const world = new World<Entity>()

export const ECS = {
  ...createComponents(world),
  world
}
