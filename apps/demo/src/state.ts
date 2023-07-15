import { With, World } from "miniplex"
import createECS from "miniplex-react"
import { ReactNode } from "react"
import { Object3D, Vector3 } from "three"

export type Entity = {
  boid?: true

  velocity?: Vector3
  neighbors?: With<Entity, "transform">[]

  transform?: Object3D
  jsx?: ReactNode
}

export const ECS = createECS(new World<Entity>())
