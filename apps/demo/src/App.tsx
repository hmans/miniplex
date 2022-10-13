import { PerspectiveCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Perf } from "r3f-perf"
import { Balls } from "./Balls"
import { Box } from "./Box"
import { Systems } from "./Systems"

function App() {
  return (
    <Canvas shadows>
      <color args={["#457b9d"]} attach="background" />
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[10, 10, 30]}
        castShadow
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
    </Canvas>
  )
}

export default App
