import { useFrame } from "@react-three/fiber"
import { Bucket } from "miniplex"
import { useOnEntityRemoved } from "miniplex/react"
import { Vector3 } from "three"
import { ECS, Entity } from "../state"

const entities = ECS.world.with("transform", "spatialHashing")

export const SpatialHashingSystem = () => {
  /*
  When an entity is removed, make sure it is also removed from
  the spatial hashing grid.
  */
  useOnEntityRemoved(entities, (entity) => {
    const cell = entityCells.get(entity)
    if (cell) cell.remove(entity)
  })

  useFrame(() => {
    for (const entity of entities) {
      /* Determine the entity's current cell */
      const p = entity.transform.position
      const key = cellKey(p.x, p.y)

      let cell = cells.get(key)

      /* Make sure the cell is initialized */
      if (!cell) {
        cell = new Bucket<Entity>()
        cells.set(key, cell)
      }

      /* If the entity has moved cells, update the spatial hash */
      const current = entityCells.get(entity)
      if (current !== cell) {
        /* Remove the entity from its previous cell */
        if (current) {
          current.remove(entity)
        }

        /* Add the entity to its new cell */
        cell.add(entity)
        entityCells.set(entity, cell)
      }
    }
  })

  return null
}

const cells = new Map<string, Bucket<Entity>>()
const entityCells = new WeakMap<Entity, Bucket<Entity>>()

export function cellKey(x: number, y: number) {
  return `${Math.floor(x)}|${Math.floor(y)}`
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
      const key = cellKey(p.x + i, p.y + j)
      const cell = cells.get(key)

      if (cell) {
        entities.push(...cell)
        if (entities.length >= max) return entities
      }
    }
  }

  return entities
}
