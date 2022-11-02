import { useFrame } from "@react-three/fiber"
import { ECS } from "../state"

const withDestroy = ECS.world.with("destroy")

export const DestroySystem = () => {
  useFrame(() => {
    for (const entity of withDestroy) {
      ECS.world.remove(entity)
    }
  })

  return null
}
