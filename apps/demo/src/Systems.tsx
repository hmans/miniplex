import { AgeSystem } from "./systems/AgeSystem"
import { DestroySystem } from "./systems/DestroySystem"
import { FindNeighborsSystem } from "./systems/findNeighborsSystem"
import { PhysicsSystem } from "./systems/physicsSystem"
import { PlayerSystem } from "./systems/playerSystem"
import { SpatialHashingSystem } from "./systems/spatialHashingSystem"

export const Systems = () => (
  <>
    <AgeSystem />
    <SpatialHashingSystem />
    <FindNeighborsSystem />
    <PhysicsSystem />
    <PlayerSystem />
    <DestroySystem />
  </>
)
