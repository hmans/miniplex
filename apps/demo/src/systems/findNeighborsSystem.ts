import { ECS } from "../state"
import { getEntitiesInRadius } from "./spatialHashingSystem"

const entities = ECS.world.archetype("transform", "neighbors", "spatialHashing")

export function findNeighborsSystem() {
  for (const entity of entities) {
    entity.neighbors.clear()

    const neighbors = getEntitiesInRadius(entity.transform.position, 1)
    for (const neighbor of neighbors) {
      entity.neighbors.add(neighbor)
    }
  }
}
