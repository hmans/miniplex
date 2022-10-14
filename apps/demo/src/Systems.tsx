import { useFrame } from "@react-three/fiber"
import { MathUtils } from "three"
import { findNeighborsSystem } from "./systems/findNeighborsSystem"
import { physicsSystem } from "./systems/physicsSystem"
import { PlayerSystem } from "./systems/playerSystem"
import { spatialHashingSystem } from "./systems/spatialHashingSystem"

export const Systems = () => {
  useFrame(function Systems(_, delta) {
    const dt = MathUtils.clamp(delta, 0, 0.2)

    spatialHashingSystem()
    findNeighborsSystem()
    physicsSystem(dt)
  })

  return (
    <>
      <PlayerSystem />
    </>
  )
}
