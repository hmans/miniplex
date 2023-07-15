import { between, insideSphere, number } from "randomish"
import { useLayoutEffect } from "react"
import { spawnBoid } from "./Boids"
import { ECS } from "./state"
import { Vector3 } from "three"

export const useWorldSetup = () =>
  useLayoutEffect(() => {
    console.log("Populating Miniplex world")

    for (let i = 0; i < 100; i++) {
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
