import { World } from "miniplex"

export type Entity = {
  transform?: THREE.Object3D
  parent?: Entity
}

export const world = new World<Entity>()
