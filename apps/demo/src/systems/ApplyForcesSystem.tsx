import { useFrame } from "@react-three/fiber"
import { ECS } from "../state"

const entities = ECS.world.with("forces", "velocity")

export default function () {
  useFrame((_, dt) => {
    for (const { forces, velocity } of entities) {
      velocity.add(forces.coherence)
      velocity.add(forces.separation)
      velocity.add(forces.alignment)
    }
  })

  return null
}
