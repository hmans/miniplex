import { world } from "../ecs"
import { scene } from "./engine"

const withTransform = world.archetype("transform")

withTransform.onEntityAdded.addListener((entity) => {
  if (entity.parent?.transform) {
    entity.parent.transform.add(entity.transform)
  } else {
    scene.add(entity.transform)
  }
})

withTransform.onEntityRemoved.addListener((entity) => {
  entity.transform.parent?.remove(entity.transform)
})

export function update() {}
