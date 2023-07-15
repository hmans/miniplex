import { between } from "randomish"
import { useLayoutEffect } from "react"
import { Vector3 } from "three"
import { spawnBoid } from "./Boids"
import { ECS } from "./state"

const useWorldSetup = () =>
  useLayoutEffect(() => {
    console.log("Populating Miniplex world")

    for (let i = 0; i < 300; i++) {
      const position = new Vector3()
        .randomDirection()
        .multiplyScalar(between(0, 10))

      const velocity = new Vector3().randomDirection()

      spawnBoid({
        position,
        velocity
      })
    }

    return () => {
      console.log("Clearing Miniplex world")
      ECS.world.clear()
    }
  }, [])

export default function WorldSetup() {
  useWorldSetup()

  return null
}
