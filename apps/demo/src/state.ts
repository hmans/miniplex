import { With, World } from "miniplex"
import createECS from "miniplex-react"
import { ReactNode } from "react"
import { Object3D, Vector3 } from "three"

export type Entity = {
  boid?: true

  velocity?: Vector3
  neighbors?: With<Entity, "transform" | "velocity">[]

  forces: {
    coherence: Vector3
    separation: Vector3
    alignment: Vector3
    avoidEdges: Vector3
  }

  transform?: Object3D
  jsx?: ReactNode
}

export const ECS = createECS(new World<Entity>())
