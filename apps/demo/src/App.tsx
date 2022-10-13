import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { useEffect } from "react"
import { DoubleSide } from "three"
import { Balls, spawnBall } from "./Balls"
import { Systems } from "./Systems"
import { plusMinus } from "randomish"
import { BOUNDS, ECS } from "./state"
import { Animate } from "@hmans/r3f-animate"

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
      <ambientLight />
      <directionalLight position={[30, 20, 10]} castShadow />

      <PerspectiveCamera position={[0, 0, 30]} makeDefault />
      <OrbitControls />

      <ECS.Entity>
        <ECS.Property name="isCube" value={true} />
        <ECS.Property name="transform">
          <Animate
            fun={(g, dt) => {
              g.rotation.z += 0.5 * dt
              g.rotation.x += 0.3 * dt
            }}
          >
            <mesh receiveShadow>
              <boxGeometry args={[BOUNDS * 2, BOUNDS * 2, BOUNDS * 2]} />
              <meshPhysicalMaterial
                color="#444"
                transparent
                opacity={0.1}
                side={DoubleSide}
              />
            </mesh>

            <Balls />
          </Animate>
        </ECS.Property>
      </ECS.Entity>

      <Systems />
    </Canvas>
  )
}

export default App
