import { Vector3 } from "three"
import { ECS, Entity } from "../state"

const entities = ECS.world.archetype("transform", "spatialHashing")

export function spatialHashingSystem() {
  for (const entity of entities) {
    /* Determine the entity's current cell */
    const p = entity.transform.position
    const key = cellKey(p.x, p.y, p.z)

    let cell = cells.get(key)

    if (!cell) {
      cell = new Array<Entity>()
      cells.set(key, cell)
    }

    /* If the entity has moved cells, update the spatial hash */
    const current = entity.spatialHashing.currentCell
    if (current !== cell) {
      /* Remove the entity from its previous cell */
      if (current) {
        const index = current.indexOf(entity)
        current[index] = current[current.length - 1]
        current.pop()
      }

      /* Add the entity to its new cell */
      cell.push(entity)
      entity.spatialHashing.currentCell = cell
    }
  }
}

const cells = new Map<string, Entity[]>()

export function cellKey(x: number, y: number, z: number) {
  return `${Math.floor(x)}|${Math.floor(y)}|${Math.floor(z)}`
}

export function getEntitiesInRadius(
  p: Vector3,
  r: number,
  max = Infinity,
  out?: Entity[]
) {
  const entities = out || []
  entities.length = 0

  for (let i = -r; i <= r; i++) {
    for (let j = -r; j <= r; j++) {
      for (let k = -r; k <= r; k++) {
        const key = cellKey(p.x + i, p.y + j, p.z + k)
        const cell = cells.get(key)

        if (cell) {
          entities.push(...cell)
          if (entities.length >= max) return entities
        }
      }
    }
  }

  return entities
}
