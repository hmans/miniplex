import { useFrame } from "@react-three/fiber"
import { ECS } from "../state"

const entities = ECS.world.with("transform", "neighbors", "forces")

export default function ({ factor = 1 }: { factor?: number }) {
  useFrame(() => {
    for (const {
      forces: { separation },
      neighbors,
      transform
    } of entities) {
      separation.set(0, 0, 0)

      for (const neighbor of neighbors) {
        const distance = transform.position.distanceTo(
          neighbor.transform.position
        )
        const direction = transform.position
          .clone()
          .sub(neighbor.transform.position)
          .normalize()
        separation.add(direction.divideScalar(distance))
      }

      separation.divideScalar(neighbors.length)
      separation.multiplyScalar(factor)
    }
  })

  return null
}
