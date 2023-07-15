import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { StrictMode } from "react"
import Boids from "./Boids"
import WorldSetup from "./WorldSetup"
import ApplyForcesSystem from "./systems/ApplyForcesSystem"
import CoherenceSystem from "./systems/CoherenceSystem"
import IdentifyNeighborSystem from "./systems/IdentifyNeighborSystem"
import SeparationSystem from "./systems/SeparationSystem"
import VelocitySystem from "./systems/VelocitySystem"
import AlignmentSystem from "./systems/AlignmentSystem"

export default function Demo() {
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

        <WorldSetup />

        <Boids />

        <IdentifyNeighborSystem />
        <CoherenceSystem factor={0.1} />
        <SeparationSystem factor={0.1} />
        <AlignmentSystem factor={0.01} />
        <ApplyForcesSystem />
        <VelocitySystem />
      </StrictMode>
    </Canvas>
  )
}
