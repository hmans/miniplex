import { useFrame } from "@react-three/fiber"
import { ECS } from "../state"
import { queueDestroy } from "./DestroySystem"

export const AgeSystem = () => {
  useFrame((_, dt) => {
    for (const entity of ECS.world.with("lifetime")) {
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
