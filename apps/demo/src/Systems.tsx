import { useFrame } from "@react-three/fiber"
import { MathUtils } from "three"
import { physicsSystem } from "./systems/physicsSystem"

export const Systems = () => {
  useFrame((_, delta) => {
    const dt = MathUtils.clamp(delta, 0, 0.2)
    physicsSystem(dt)
  })

  return null
}
