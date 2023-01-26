import { World } from "miniplex"
import { Entity } from "./engine"

export function createTransformSystem(world: World<Entity>) {
  const entities = world.with("transform")
  const engines = world.with("engine")

  entities.onEntityAdded.subscribe((entity) => {
    const [{ engine }] = engines

    if (entity.parent?.transform) {
      entity.parent.transform.add(entity.transform)
    } else {
      engine.scene.add(entity.transform)
    }
  })

  entities.onEntityRemoved.subscribe((entity) => {
    entity.transform.parent?.remove(entity.transform)
  })

  return () => {}
}
