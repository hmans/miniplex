import { useFrame } from "@react-three/fiber"
import { ECS } from "../state"

const entities = ECS.world.with("transform", "neighbors", "forces")

export default function () {
  useFrame((_, dt) => {
    for (const {
      forces: { coherence },
      neighbors,
      transform
    } of entities) {
      coherence.set(0, 0, 0)

      for (const neighbor of neighbors) {
        coherence.add(neighbor.transform.position)
      }

      coherence.divideScalar(neighbors.length)
      coherence.sub(transform.position).multiplyScalar(0.01)
    }
  })

  return null
}
