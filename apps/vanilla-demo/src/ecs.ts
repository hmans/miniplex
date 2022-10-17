import { World } from "miniplex"

export type Entity = {
  transform?: THREE.Object3D
}

export const world = new World<Entity>()
