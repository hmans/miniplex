import { World } from "miniplex"
import createECS from "miniplex-react"
import { ReactNode } from "react"
import { Object3D, Vector3 } from "three"

export type Entity = {
  boid?: true

  velocity?: Vector3

  transform?: Object3D
  jsx?: ReactNode
}

export const ECS = createECS(new World<Entity>())
