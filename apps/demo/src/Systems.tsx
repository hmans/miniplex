import { Vector3 } from "three"
import { AgeSystem } from "./systems/AgeSystem"
import { CameraRigSystem } from "./systems/CameraRigSystem"
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

    <CameraRigSystem offset={new Vector3(0, 0, 20)} />
    <DestroySystem />
  </>
)
