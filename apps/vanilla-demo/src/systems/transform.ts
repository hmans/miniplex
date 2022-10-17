import { world } from "../ecs"
import { scene } from "./engine"

const withTransform = world.archetype("object3D")

withTransform.onEntityAdded.addListener((entity) => {
  if (entity.parent?.object3D) {
    entity.parent.object3D.add(entity.object3D)
  } else {
    scene.add(entity.object3D)
  }
})

withTransform.onEntityRemoved.addListener((entity) => {
  entity.object3D.parent?.remove(entity.object3D)
})

export function update() {}
