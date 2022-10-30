import { archetype, World } from "miniplex"
import { Entity } from "./engine"

export function createTransformSystem(world: World<Entity>) {
  const entities = world.where(archetype("transform"))
  const engines = world.where(archetype("engine"))

  entities.onEntityAdded.add((entity) => {
    const [{ engine }] = engines

    if (entity.parent?.transform) {
      entity.parent.transform.add(entity.transform)
    } else {
      engine.scene.add(entity.transform)
    }
  })

  entities.onEntityRemoved.add((entity) => {
    entity.transform.parent?.remove(entity.transform)
  })

  return () => {}
}
