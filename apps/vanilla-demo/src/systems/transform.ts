import { world } from "../ecs"
import { scene } from "./engine"

const withTransform = world.archetype("transform")

withTransform.onEntityAdded.addListener((entity) => {
  scene.add(entity.transform)
})

withTransform.onEntityRemoved.addListener((entity) => {
  scene.remove(entity.transform)
})

export function update() {}
