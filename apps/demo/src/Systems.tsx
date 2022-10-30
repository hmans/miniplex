import { Vector3 } from "three"
import { AgeSystem } from "./systems/AgeSystem"
import { AsteroidsSystem } from "./systems/AsteroidsSystem"
import { CameraRigSystem } from "./systems/CameraRigSystem"
import { DestroySystem } from "./systems/DestroySystem"
import { FindNeighborsSystem } from "./systems/findNeighborsSystem"
import { PhysicsSystem } from "./systems/PhysicsSystemMoo"
import { PlayerSystem } from "./systems/playerSystem"
import { SpatialHashingSystem } from "./systems/spatialHashingSystem"

export const Systems = () => (
  <>
    <AgeSystem />
    <SpatialHashingSystem />
    <FindNeighborsSystem />
    <PhysicsSystem />
    <PlayerSystem />
    <AsteroidsSystem />

    <CameraRigSystem offset={new Vector3(0, -20, 30)} />
    <DestroySystem />
  </>
)
