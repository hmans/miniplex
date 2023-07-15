import { useFrame } from "@react-three/fiber"
import { ECS } from "../state"

const entities = ECS.world.with("transform", "forces")

export default function ({
  factor = 1,
  maxDistance = 2
}: {
  factor?: number
  maxDistance?: number
}) {
  useFrame(function AvoidEdgesSystem() {
    for (const {
      forces: { avoidEdges },
      transform
    } of entities) {
      /* Calculate our distance from origin */
      const distance = transform.position.length()

      /* If we're too far away, gently nudge the boid back towards origin */
      if (distance > maxDistance) {
        avoidEdges
          .copy(transform.position)
          .normalize()
          .negate()
          .multiplyScalar(factor)
      }
    }
  })

  return null
}
