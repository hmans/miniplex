import { Object3D } from "three"
import { World } from "miniplex"
import createECS from "miniplex/react"
import { ReactNode } from "react"

export type Entity = {
  object3d?: Object3D
  boid?: true
  jsx?: ReactNode
}

export const ECS = createECS(new World<Entity>())
