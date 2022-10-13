import { PerspectiveCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Perf } from "r3f-perf"
import { plusMinus } from "randomish"
import { useEffect } from "react"
import { Balls, spawnBall } from "./Balls"
import { Box } from "./Box"
import { BOUNDS } from "./state"
import { Systems } from "./Systems"

function App() {
  useEffect(() => {
    const id = setInterval(() => {
      spawnBall({
        position: [
          plusMinus(BOUNDS - 1),
          plusMinus(BOUNDS - 1),
          plusMinus(BOUNDS - 1)
        ]
      })
    }, 50)

    return () => {
      clearInterval(id)
    }
  })

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
