import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { StrictMode } from "react"
import Boids from "./Boids"
import VelocitySystem from "./systems/VelocitySystem"
import { useWorldSetup } from "./useWorldSetup"
import IdentifyNeighborSystem from "./systems/IdentifyNeighborSystem"
import CoherenceSystem from "./systems/CoherenceSystem"
import ApplyForcesSystem from "./systems/ApplyForcesSystem"
import SeparationSystem from "./systems/SeparationSystem"

export default function Demo() {
  /* We've created a custom hook that will initialize the ECS world
  on mount and clear it on unmount. */
  useWorldSetup()

  return (
    <Canvas>
      {/*
      R3F unfortunately doesn't inherit <StrictMode> from outside
      its canvas, so we need to explicitly re-enable it if we want to make use of it.
      We're doing this here mostly to prove that Miniplex 2.0 works with it :-)
      */}
      <StrictMode>
        <ambientLight intensity={0.2} />
        <directionalLight position={[1, 2, 3]} intensity={0.8} />
        <PerspectiveCamera makeDefault position={[0, 0, 20]} />
        <OrbitControls autoRotate autoRotateSpeed={0.3} />

        <Boids />

        <IdentifyNeighborSystem />
        <CoherenceSystem />
        <SeparationSystem />
        <ApplyForcesSystem />
        <VelocitySystem />
      </StrictMode>
    </Canvas>
  )
}
