import { Canvas } from "@react-three/fiber"
import { useEffect } from "react"
import { Balls, spawnBall } from "./Balls"
import { Systems } from "./Systems"

function App() {
  useEffect(() => {
    const id = setInterval(() => {
      spawnBall({ position: [0, 0, 0] })
    }, 500)

    return () => {
      clearInterval(id)
    }
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
