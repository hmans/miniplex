import { FindNeighborsSystem } from "./systems/findNeighborsSystem"
import { PhysicsSystem } from "./systems/physicsSystem"
import { PlayerSystem } from "./systems/playerSystem"
import { SpatialHashingSystem } from "./systems/spatialHashingSystem"

export const Systems = () => (
  <>
    <SpatialHashingSystem />
    <FindNeighborsSystem />
    <PhysicsSystem />
    <PlayerSystem />
  </>
)
