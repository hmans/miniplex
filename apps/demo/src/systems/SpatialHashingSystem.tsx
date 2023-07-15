import { useFrame } from "@react-three/fiber"
import { ECS, Entity } from "../state"
import { useEffect, useMemo } from "react"

type Cell = Set<Entity>

export class SpatialHashMap {
  protected cells = new Map<string, Cell>()
  protected entityToCell = new WeakMap<Entity, Cell>()

  constructor(public cellSize: number) {}

  setEntity(entity: Entity, x: number, y: number, z: number) {
    const cell = this.getCell(x, y, z)

    /* Remove from previous hash if known */
    const oldCell = this.entityToCell.get(entity)

    if (oldCell) {
      /* If hash didn't change, do nothing */
      if (oldCell === cell) return

      /* Remove from previous hash */
      oldCell.delete(entity)
    }

    cell.add(entity)
    this.entityToCell.set(entity, cell)
  }

  removeEntity(entity: Entity) {
    const cell = this.entityToCell.get(entity)
    cell?.delete(entity)
    this.entityToCell.delete(entity)
  }

  getNearbyEntities(x: number, y: number, z: number, radius: number) {
    const entities = new Set<Entity>()

    for (let dx = x - radius; dx <= x + radius; dx += this.cellSize) {
      for (let dy = y - radius; dy <= y + radius; dy += this.cellSize) {
        for (let dz = z - radius; dz <= z + radius; dz += this.cellSize) {
          const cell = this.getCell(dx, dy, dz)

          for (const entity of cell) {
            entities.add(entity)
          }
        }
      }
    }

    return entities
  }

  protected getCell(x: number, y: number, z: number) {
    const hash = this.calculateHash(x, y, z, this.cellSize)

    if (!this.cells.has(hash)) {
      this.cells.set(hash, new Set())
    }

    return this.cells.get(hash)!
  }

  protected calculateHash(x: number, y: number, z: number, cellSize: number) {
    const hx = Math.floor(x / cellSize)
    const hy = Math.floor(y / cellSize)
    const hz = Math.floor(z / cellSize)

    return `${hx}:${hy}:${hz}`
  }
}

const entities = ECS.world.with("transform", "spatialHashMap")

export default function ({ cellSize = 1 }: { cellSize?: number }) {
  useFrame(function SpatialHashingSystem() {
    for (const entity of entities) {
      entity.spatialHashMap.setEntity(
        entity,
        entity.transform.position.x,
        entity.transform.position.y,
        entity.transform.position.z
      )
    }
  })

  return null
}
