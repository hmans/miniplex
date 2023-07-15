import { useFrame } from "@react-three/fiber"
import { ECS } from "../state"

const entities = ECS.world.with("transform", "neighbors", "forces")

export default function ({ factor = 1 }: { factor?: number }) {
  useFrame((_, dt) => {
    for (const {
      forces: { alignment },
      neighbors
    } of entities) {
      alignment.set(0, 0, 0)

      if (neighbors.length === 0) continue

      for (const neighbor of neighbors) {
        alignment.add(neighbor.velocity)
      }

      alignment.divideScalar(neighbors.length)
      alignment.multiplyScalar(factor)
    }
  })

  return null
}
