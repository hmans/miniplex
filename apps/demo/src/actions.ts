import { hasComponents } from "miniplex"
import { ECS, Entity } from "./state"

export function applyDamage(entity: Entity, damage: number) {
  if (!hasComponents(entity, "health")) return

  entity.health -= damage

  if (entity.health <= 0) {
    queueDestroy(entity)
  }
}

export const queueDestroy = (entity: Entity) => {
  if ("destroy" in entity) return
  ECS.world.addComponent(entity, "destroy", true)
}
