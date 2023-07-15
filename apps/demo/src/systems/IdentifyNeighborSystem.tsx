import { useFrame } from "@react-three/fiber"
import { ECS } from "../state"

const entities = ECS.world.with("transform", "neighbors", "velocity")

export default function ({ maxDistance = 5 }: { maxDistance?: number }) {
  useFrame((_, dt) => {
    for (const entity of entities) {
      /* Clear the neighbors list */
      entity.neighbors.length = 0

      for (const otherEntity of entities) {
        /* The entity can't be its own neighbor */
        if (entity === otherEntity) continue

        /* Calculate distance */
        const distance = entity.transform.position.distanceTo(
          otherEntity.transform.position
        )

        if (distance <= maxDistance) {
          entity.neighbors.push(otherEntity)
        }
      }
    }
  })

  return null
}
