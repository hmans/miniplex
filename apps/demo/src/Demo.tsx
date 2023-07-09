import { Canvas } from "@react-three/fiber"
import Boids, { spawnBoid } from "./Boids"
import { useLayoutEffect } from "react"

function Demo() {
  useLayoutEffect(() => {
    spawnBoid({})
  }, [])

  return (
    <Canvas>
      <ambientLight intensity={0.2} />
      <directionalLight position={[1, 2, 3]} intensity={0.8} />
      <Boids />
    </Canvas>
  )
}

export default Demo
