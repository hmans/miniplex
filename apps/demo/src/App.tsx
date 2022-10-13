import { Canvas } from "@react-three/fiber"
import { useEffect } from "react"
import { Balls, spawnBall } from "./Balls"
import { Systems } from "./Systems"

function App() {
  useEffect(() => {
    spawnBall({ position: [0, 0, 0] })
  })

  return (
    <Canvas>
      <ambientLight />
      <directionalLight position={[10, 10, 5]} />

      <Balls />

      <Systems />
    </Canvas>
  )
}

export default App
