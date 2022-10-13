import { World } from "miniplex"
import { createComponents } from "miniplex-react"
import { Object3D } from "three"

export type Entity = {
  isBall?: true

  transform?: Object3D
  jsx?: JSX.Element
}

const world = new World<Entity>()

export const ECS = {
  ...createComponents(world),
  world
}
