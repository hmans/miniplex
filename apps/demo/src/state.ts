import { World } from "miniplex"
import { createComponents } from "miniplex/react"
import { Object3D, Vector3 } from "three"

export const BOUNDS = 5

export type Entity = {
  isPlayer?: true
  isAsteroid?: true

  jsx?: JSX.Element
  transform?: Object3D

  spatialHashing?: {
    currentCell?: Entity[]
  }

  neighbors?: Entity[]

  physics?: Physics
}

type Physics = {
  velocity: Vector3
  angularVelocity: Vector3
  linearDamping: number
  angularDamping: number
  mass: number
  radius: number
  restitution: number
}

export const physics = (input: Partial<Physics> = {}): Physics => ({
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
