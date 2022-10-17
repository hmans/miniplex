import { World } from "miniplex"

export type Entity = {
  object3D?: THREE.Object3D
  parent?: Entity
  autorotate?: THREE.Vector3
}

export const world = new World<Entity>()
