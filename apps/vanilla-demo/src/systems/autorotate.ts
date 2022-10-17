import { world } from "../ecs"

const entities = world.archetype("autorotate", "object3D")

export function update() {
  for (const { object3D: transform, autorotate } of entities) {
    transform.rotation.x += autorotate.x
    transform.rotation.y += autorotate.y
    transform.rotation.z += autorotate.z
  }
}
