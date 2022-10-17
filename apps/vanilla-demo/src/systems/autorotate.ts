import { world } from "../ecs"

const entities = world.archetype("autorotate", "object3D")

export function update(dt: number) {
  for (const { object3D: transform, autorotate } of entities) {
    transform.rotation.x += autorotate.x * dt
    transform.rotation.y += autorotate.y * dt
    transform.rotation.z += autorotate.z * dt
  }
}
