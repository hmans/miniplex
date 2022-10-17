import { world } from "../ecs"

const withTransform = world.archetype("transform")
const engines = world.archetype("engine")

withTransform.onEntityAdded.addListener((entity) => {
  const [{ engine }] = engines
  if (entity.parent?.transform) {
    entity.parent.transform.add(entity.transform)
  } else {
    engine.scene.add(entity.transform)
  }
})

withTransform.onEntityRemoved.addListener((entity) => {
  entity.transform.parent?.remove(entity.transform)
})

export function update() {}
