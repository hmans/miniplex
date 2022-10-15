import { useFrame } from "@react-three/fiber"
import { MathUtils } from "three"
import { findNeighborsSystem } from "./systems/findNeighborsSystem"
import { PhysicsSystem, physicsSystem } from "./systems/physicsSystem"
import { PlayerSystem } from "./systems/playerSystem"
import { spatialHashingSystem } from "./systems/spatialHashingSystem"

export const Systems = () => {
  useFrame(function Systems() {
    spatialHashingSystem()
    findNeighborsSystem()
  })

  return (
    <>
      <PhysicsSystem />
      <PlayerSystem />
    </>
  )
}
