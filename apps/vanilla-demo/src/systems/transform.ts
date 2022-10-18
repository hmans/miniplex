import { World } from "miniplex"
import { Entity } from "./engine"

export function createTransformSystem(world: World<Entity>) {
  const entities = world.archetype("transform")
  const engines = world.archetype("engine")

  entities.onEntityAdded.addListener((entity) => {
    const [{ engine }] = engines

    if (entity.parent?.transform) {
      entity.parent.transform.add(entity.transform)
    } else {
      engine.scene.add(entity.transform)
    }
  })

  entities.onEntityRemoved.addListener((entity) => {
    entity.transform.parent?.remove(entity.transform)
  })

  return () => {}
}
