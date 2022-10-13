import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { useEffect } from "react"
import { DoubleSide } from "three"
import { Balls, spawnBall } from "./Balls"
import { Systems } from "./Systems"
import { plusMinus } from "randomish"
import { BOUNDS } from "./state"

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
    }, 500)

    return () => {
      clearInterval(id)
    }
  })

  return (
    <Canvas>
      <ambientLight />
      <directionalLight position={[30, 20, 10]} />
      <PerspectiveCamera position={[0, 0, 30]} makeDefault />
      <OrbitControls />

      <mesh>
        <boxGeometry args={[BOUNDS * 2, BOUNDS * 2, BOUNDS * 2]} />
        <meshPhysicalMaterial
          color="#444"
          transparent
          opacity={0.1}
          side={DoubleSide}
        />
        <Balls />
      </mesh>

      <Systems />
    </Canvas>
  )
}

export default App
