import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { StrictMode } from "react"
import Boids from "./Boids"
import AlignmentSystem from "./systems/AlignmentSystem"
import ApplyForcesSystem from "./systems/ApplyForcesSystem"
import AvoidEdgesSystem from "./systems/AvoidEdgesSystem"
import CoherenceSystem from "./systems/CoherenceSystem"
import IdentifyNeighborSystem from "./systems/IdentifyNeighborSystem"
import SeparationSystem from "./systems/SeparationSystem"
import SpatialHashingSystem from "./systems/SpatialHashingSystem"
import VelocitySystem from "./systems/VelocitySystem"
import WorldSetupSystem from "./systems/WorldSetupSystem"

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
        <PerspectiveCamera makeDefault position={[0, 0, 50]} />
        <OrbitControls />

        <Boids />

        <WorldSetupSystem />
        <SpatialHashingSystem />
        <IdentifyNeighborSystem maxDistance={3} />
        <CoherenceSystem factor={3} />
        <SeparationSystem factor={8} />
        <AlignmentSystem factor={1} />
        <AvoidEdgesSystem factor={5} maxDistance={20} />
        <ApplyForcesSystem />
        <VelocitySystem maxVelocity={6} />
      </StrictMode>
    </Canvas>
  )
}
