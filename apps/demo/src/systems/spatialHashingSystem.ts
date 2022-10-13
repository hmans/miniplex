import { Vector3 } from "three"
import { ECS, Entity } from "../state"

const entities = ECS.world.archetype("transform", "spatialHashing")

export function spatialHashingSystem() {
  for (const entity of entities) {
    /* Determine the entity's current cell */
    const p = entity.transform.position
    const key = cellKey(p.x, p.y, p.z)

    /* If the entity has moved cells, update the spatial hash */
    if (entity.spatialHashing.currentCell !== key) {
      /* Remove the entity from its previous cell */
      if (entity.spatialHashing.currentCell) {
        const oldCell = cells.get(entity.spatialHashing.currentCell)!
        oldCell.delete(entity)
      }

      /* Make sure a cell exists */
      if (!cells.has(key)) cells.set(key, new Set())

      /* Add the entity to its new cell */
      cells.get(key)!.add(entity)
      entity.spatialHashing.currentCell = key
    }
  }
}

const cells = new Map<string, Set<Entity>>()

export function cellKey(x: number, y: number, z: number) {
  return `${Math.floor(x)}|${Math.floor(y)}|${Math.floor(z)}`
}

export function getEntitiesInRadius(p: Vector3, r: number) {
  const entities: Entity[] = []

  const x = Math.floor(p.x)
  const y = Math.floor(p.y)
  const z = Math.floor(p.z)

  for (let i = -r; i <= r; i++) {
    for (let j = -r; j <= r; j++) {
      for (let k = -r; k <= r; k++) {
        const key = cellKey(x + i, y + j, z + k)
        const contents = cells.get(key)
        if (contents) entities.push(...contents)
      }
    }
  }
  return entities
}
