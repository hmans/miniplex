import { World } from "miniplex"
import { createComponents } from "miniplex/react"
import { Object3D, Vector3 } from "three"

export const BOUNDS = 5

export type Entity = {
  isBall?: true
  isCube?: true

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
  mass: number
  radius: number
  restitution: number
}

export const physics = (input: Partial<Physics> = {}) => ({
  velocity: new Vector3(0, 0, 0),
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
