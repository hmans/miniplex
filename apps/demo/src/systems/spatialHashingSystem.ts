import { Vector3 } from "three"
import { ECS, Entity } from "../state"

const entities = ECS.world.archetype("transform")

export function spatialHashingSystem() {
  /* Bluntly clear the spatial hash every frame. TODO: optimize this */
  cells.clear()

  for (const entity of entities) {
    const p = entity.transform.position
    const key = cellKey(p.x, p.y, p.z)
    if (!cells.has(key)) cells.set(key, [])
    cells.get(key)!.push(entity)
  }
}

const cells = new Map<string, Entity[]>()

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
