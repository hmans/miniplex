import { useFrame } from "@react-three/fiber"
import { useLayoutEffect } from "react"
import { Vector3 } from "three"
import { ECS, Entity } from "../state"

const entities = ECS.world.archetype("transform", "spatialHashing")

const cells = new Map<string, Entity[]>()
const entityCells = new WeakMap<Entity, Entity[]>()

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

export const SpatialHashingSystem = () => {
  useLayoutEffect(
    () =>
      entities.onEntityRemoved.addListener((entity) => {
        const cell = entityCells.get(entity)

        if (cell) {
          const index = cell.indexOf(entity)
          if (index !== -1) {
            cell[index] = cell[cell.length - 1]
            cell.pop()
          }
        }
      }),
    []
  )

  useFrame(() => {
    for (const entity of entities) {
      /* Determine the entity's current cell */
      const p = entity.transform.position
      const key = cellKey(p.x, p.y)

      let cell = cells.get(key)

      /* Make sure the cell is initialized */
      if (!cell) {
        cell = new Array<Entity>()
        cells.set(key, cell)
      }

      /* If the entity has moved cells, update the spatial hash */
      const current = entityCells.get(entity)
      if (current !== cell) {
        /* Remove the entity from its previous cell */
        if (current) {
          const index = current.indexOf(entity)
          current[index] = current[current.length - 1]
          current.pop()
        }

        /* Add the entity to its new cell */
        cell.push(entity)
        entityCells.set(entity, cell)
      }
    }
  })

  return null
}
