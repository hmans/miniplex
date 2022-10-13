import { ECS } from "../state"
import { getEntitiesInRadius } from "./spatialHashingSystem"

const entities = ECS.world.archetype("transform", "neighbors", "spatialHashing")

export function findNeighborsSystem() {
  for (const entity of entities) {
    getEntitiesInRadius(
      entity.transform.position,
      0.5,
      Infinity,
      entity.neighbors
    )
  }
}
