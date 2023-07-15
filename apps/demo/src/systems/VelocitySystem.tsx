import { useFrame } from "@react-three/fiber"
import { ECS } from "../state"

const entities = ECS.world.with("transform", "velocity")

export default function ({ maxVelocity = 1 }: { maxVelocity?: number }) {
  useFrame((_, dt) => {
    for (const { transform, velocity } of entities) {
      /* Dampen velocity */
      // velocity.multiplyScalar(0.999)

      /* Clamp velocity  */
      velocity.clampLength(0, maxVelocity)

      /* Apply velocity */
      transform.position.addScaledVector(velocity, dt)
    }
  })

  return null
}
