import { useFrame } from "@react-three/fiber"
import { ECS, Entity } from "../state"

const entities = ECS.world.with(
  "transform",
  "neighbors",
  "velocity",
  "spatialHashMap"
)

export default function ({ maxDistance = 5 }: { maxDistance?: number }) {
  useFrame(function IdentifyNeighborsSystem(_, dt) {
    for (const entity of entities) {
      /* Clear the neighbors list */
      entity.neighbors.length = 0

      /* Query the spatial hash map for nearby entities */
      const nearbyEntities = entity.spatialHashMap.getNearbyEntities(
        entity.transform.position.x,
        entity.transform.position.y,
        entity.transform.position.z,
        maxDistance
      )

      for (const otherEntity of nearbyEntities) {
        /* The entity can't be its own neighbor */
        if (entity === otherEntity) continue

        /* Calculate distance */
        const distance = entity.transform.position.distanceTo(
          otherEntity.transform!.position
        )

        if (distance <= maxDistance) {
          entity.neighbors.push(otherEntity as any)
        }
      }
    }
  })

  return null
}
