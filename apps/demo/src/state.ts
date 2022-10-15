import { World } from "miniplex"
import { createComponents } from "miniplex/react"
import { ReactNode } from "react"
import { Object3D, Vector3 } from "three"

export const BOUNDS = 10

export type Entity = {
  isPlayer?: true
  isAsteroid?: true

  transform?: Object3D

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
  ...input
})

const world = new World<Entity>()

export const ECS = {
  ...createComponents(world),
  world
}
