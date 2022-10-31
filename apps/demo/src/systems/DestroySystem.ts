import { useFrame } from "@react-three/fiber"
import { archetype } from "miniplex"
import { ECS } from "../state"

const withDestroy = ECS.world.where(archetype("destroy"))

export const DestroySystem = () => {
  useFrame(() => {
    for (const entity of withDestroy) {
      ECS.world.remove(entity)
    }
  })

  return null
}
