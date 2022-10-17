import { world } from "../ecs"

const entities = world.archetype("autorotate", "transform")

export function update(dt: number) {
  for (const { transform: transform, autorotate } of entities) {
    transform.rotation.x += autorotate.x * dt
    transform.rotation.y += autorotate.y * dt
    transform.rotation.z += autorotate.z * dt
  }
}
