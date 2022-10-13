import { Environment, PerspectiveCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Perf } from "r3f-perf"
import { StrictMode, Suspense } from "react"
import { Balls } from "./Balls"
import { Box } from "./Box"
import { Systems } from "./Systems"

function App() {
  return (
    <Canvas shadows>
      <StrictMode>
        <color args={["#457b9d"]} attach="background" />
        <Suspense>
          <Environment preset="sunset" />
          <ambientLight intensity={0.2} />
          <directionalLight
            position={[10, 10, 30]}
            castShadow
            intensity={1}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={200}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
          />

          <PerspectiveCamera position={[0, 0, 30]} makeDefault />

          <Box>
            <Balls />
          </Box>

          <Systems />
          <Perf position="bottom-right" matrixUpdate />
        </Suspense>
      </StrictMode>
    </Canvas>
  )
}

export default App
