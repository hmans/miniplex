import { useFrame } from "@react-three/fiber"
import { physicsSystem } from "./systems/physicsSystem"

export const Systems = () => {
  useFrame((_, dt) => {
    physicsSystem(dt)
  })

  return null
}
