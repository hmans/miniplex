import { World } from "miniplex"
import { createComponents } from "miniplex-react"
import { Object3D, Vector3 } from "three"

export const BOUNDS = 5

export type Entity = {
  isBall?: true
  isCube?: true

  jsx?: JSX.Element
  transform?: Object3D

  spatialHashing?: {
    currentCell?: Set<Entity>
  }

  physics?: {
    velocity: Vector3
    mass: number
    radius: number
    restitution: number
  }
}

const world = new World<Entity>()

export const ECS = {
  ...createComponents(world),
  world
}
