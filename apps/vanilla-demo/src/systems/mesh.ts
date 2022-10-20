import { World } from "miniplex"
import { Entity } from "./engine"
import * as THREE from "three"

export function createMeshSystem(world: World<Entity>) {
  const entities = world.with("mesh")

  entities.onEntityAdded.add((e) => {
    if (!e.transform) {
      world.addComponent(
        e,
        "transform",
        new THREE.Mesh(e.mesh.geometry, e.mesh.material)
      )
    }
  })

  entities.onEntityRemoved.add((e) => {
    if (e.transform) {
      world.removeComponent(e, "transform")
    }
  })

  return function () {}
}
