import { World } from "miniplex"
import { Entity } from "./engine"

export function createTransformSystem(world: World<Entity>) {
  const entities = world.with("transform")
  const engines = world.with("engine")

  const monitor = entities
    .monitor()

    /* Mount a callback that will be executed for every entity arriving in this query */
    .setup(({ transform, parent }) => {
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
    .teardown(({ transform }) => {
      /* Remove the transform from its parent */
      transform.parent?.remove(transform)
    })

  /* Return a function that will execute every frame */
  return () => {
    monitor.run()
  }
}
