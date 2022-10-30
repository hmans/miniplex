import { useFrame } from "@react-three/fiber"
import { archetype } from "miniplex"
import { queueDestroy } from "../actions"
import { ECS } from "../state"

export const AgeSystem = () => {
  useFrame((_, dt) => {
    for (const entity of ECS.world.where(archetype("lifetime"))) {
      entity.lifetime.age += dt

      if (
        entity.lifetime.maxAge &&
        entity.lifetime.age >= entity.lifetime.maxAge &&
        !entity.destroy
      ) {
        queueDestroy(entity)
      }
    }
  })

  return null
}
