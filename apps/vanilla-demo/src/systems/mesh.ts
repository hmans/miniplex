import { World } from "miniplex"
import { Entity } from "./engine"
import * as THREE from "three"

export function createMeshSystem(world: World<Entity>) {
  const entities = world.with("mesh", "transform")

  entities.onEntityAdded.add((e) => {
    e.transform.add(new THREE.Mesh(e.mesh.geometry, e.mesh.material))
  })

  entities.onEntityRemoved.add((e) => {
    /* Here's where we need the callback to happen before the
    components are actually removed */

    e.transform.clear() /* transform may be undefined */
  })

  return function () {}
}
