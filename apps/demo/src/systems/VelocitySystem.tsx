import { useFrame } from "@react-three/fiber"
import { ECS } from "../state"

const entities = ECS.world.with("transform", "velocity")

export default function () {
  useFrame((_, dt) => {
    for (const { transform, velocity } of entities) {
      transform.position.addScaledVector(velocity, dt)
    }
  })

  return null
}
