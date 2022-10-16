import { useFrame } from "@react-three/fiber"
import { ECS } from "../state"

export const DestroySystem = () => {
  useFrame(() => {
    for (const entity of ECS.world.archetype("destroy")) {
      ECS.world.remove(entity)
    }
  })

  return null
}
