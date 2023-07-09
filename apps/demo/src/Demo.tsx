import { PerspectiveCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { insideSphere } from "randomish"
import { StrictMode, useLayoutEffect } from "react"
import Boids, { spawnBoid } from "./Boids"
import { ECS } from "./state"

const useWorldSetup = () =>
  useLayoutEffect(() => {
    console.log("Populating Miniplex world")

    for (let i = 0; i < 100; i++) {
      const position = insideSphere(10)

      spawnBoid({
        position: [position.x, position.y, position.z]
      })
    }

    return () => {
      console.log("Clearing Miniplex world")
      ECS.world.clear()
    }
  }, [])

export default function Demo() {
  useWorldSetup()

  return (
    <Canvas>
      {/*
      R3F unfortunately doesn't inherit <StrictMode> from outside
      its canvas, so we need to explicitly re-enable it if we want to make use of it.
      */}
      <StrictMode>
        <ambientLight intensity={0.2} />
        <directionalLight position={[1, 2, 3]} intensity={0.8} />
        <PerspectiveCamera makeDefault position={[0, 0, 20]} />

        <Boids />
      </StrictMode>
    </Canvas>
  )
}
