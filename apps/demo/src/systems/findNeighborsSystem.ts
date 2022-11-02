import { useFrame } from "@react-three/fiber"
import { ECS } from "../state"
import { getEntitiesInRadius } from "./SpatialHashingSystem"

const entities = ECS.world.with(
  "transform",
  "physics",
  "neighbors",
  "spatialHashing"
)

export const FindNeighborsSystem = () => {
  useFrame(() => {
    for (const entity of entities) {
      /* If the body is sleeping, skip it */
      if (entity.physics.sleeping) continue

      getEntitiesInRadius(
        entity.transform.position,
        Math.max(2, entity.physics.radius * 2),
        Infinity,
        entity.neighbors
      )
    }
  })

  return null
}
