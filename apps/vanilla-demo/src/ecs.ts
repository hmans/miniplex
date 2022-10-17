import { World } from "miniplex"

export type Entity = {
  transform?: THREE.Object3D
  parent?: Entity
  autorotate?: THREE.Vector3

  engine?: {
    renderer: THREE.WebGLRenderer
    camera: THREE.PerspectiveCamera
    scene: THREE.Scene
  }
}

export const world = new World<Entity>()
