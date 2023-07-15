import { useFrame } from "@react-three/fiber"
import { ECS, Entity } from "../state"

const entities = ECS.world.with("transform", "neighbors", "spatialHashMap")

export default function ({ maxDistance = 5 }: { maxDistance?: number }) {
  useFrame(function IdentifyNeighborsSystem(_, dt) {
    for (const entity of entities) {
      const { transform, neighbors, spatialHashMap } = entity

      /* Query the spatial hash map for nearby entities */
      spatialHashMap.getNearbyEntities(
        transform.position.x,
        transform.position.y,
        transform.position.z,
        maxDistance,
        neighbors,
        100
      )

      /* Remove entity itself from neighbors */
      neighbors.splice(neighbors.indexOf(entity as any), 1)

      // for (const otherEntity of entity.neighbors) {
      //   /* The entity can't be its own neighbor */
      //   if (entity === otherEntity) {
      //     /* remove */
      //     entity.neighbors.splice(entity.neighbors.indexOf(otherEntity), 1)
      //   }

      //   /* Calculate distance */
      //   const distance = entity.transform.position.distanceTo(
      //     otherEntity.transform!.position
      //   )

      //   if (distance >= maxDistance) {
      //     /* remove */
      //     entity.neighbors.splice(entity.neighbors.indexOf(otherEntity), 1)
      //   }
      // }
    }
  })

  return null
}
