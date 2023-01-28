import { World } from "miniplex"
import { Entity } from "./engine"

export function createTransformSystem(world: World<Entity>) {
  const entities = world.with("transform")
  const engines = world.with("engine")

  entities
    .monitor()

    /* Mount a callback that will be executed for every entity arriving in this query */
    .onAdd(({ transform, parent }) => {
      /* If the entity has a parent, add the transform to the parent's transform */
      if (parent?.transform) {
        parent.transform.add(transform)
        return
      }

      /* Otherwise, add the transform to the scene */
      const { engine } = engines.first!
      engine.scene.add(transform)
    })

    /* Mount a callback that will be executed for every entity leaving this query */
    .onRemove(({ transform }) => {
      /* Remove the transform from its parent */
      transform.parent?.remove(transform)
    })

  return () => {}
}
