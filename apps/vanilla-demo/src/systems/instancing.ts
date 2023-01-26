import { World } from "miniplex"
import { Entity } from "./engine"

export function createInstancingSystem(world: World<Entity>) {
  const entities = world.with("instance", "transform")

  const imeshState = new Map<THREE.InstancedMesh, number>()

  return function instancingSystem() {
    /* Clear counts */
    imeshState.clear()

    for (const {
      instance: { imesh },
      transform
    } of entities) {
      /* Get the current instance count */
      const index = imeshState.get(imesh) ?? 0

      /* Set the instance matrix */
      imesh.setMatrixAt(index, transform.matrix)

      /* Increment the instance count */
      imeshState.set(imesh, index + 1)
    }

    /* Update instance mesh counts */
    for (const [imesh, count] of imeshState) {
      imesh.count = count
      imesh.instanceMatrix.needsUpdate = true
    }
  }
}
