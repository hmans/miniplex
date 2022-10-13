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
      <directionalLight position={[20, 10, 30]} castShadow />

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
