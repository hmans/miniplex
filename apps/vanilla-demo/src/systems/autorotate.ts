import { archetype, World } from "miniplex"
import { Entity } from "./engine"

export function createAutorotateSystem(world: World<Entity>) {
  const entities = world.where(archetype("autorotate", "transform"))

  return function (dt: number) {
    for (const { transform: transform, autorotate } of entities) {
      transform.rotation.x += autorotate.x * dt
      transform.rotation.y += autorotate.y * dt
      transform.rotation.z += autorotate.z * dt
    }
  }
}
