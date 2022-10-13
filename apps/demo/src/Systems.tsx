import { useFrame } from "@react-three/fiber"
import { MathUtils } from "three"
import { physicsSystem } from "./systems/physicsSystem"
import { spatialHashingSystem } from "./systems/spatialHashingSystem"

export const Systems = () => {
  useFrame(function Systems(_, delta) {
    const dt = MathUtils.clamp(delta, 0, 0.2)
    spatialHashingSystem()
    physicsSystem(dt)
  })

  return null
}
