import { useFrame } from "@react-three/fiber"
import { useEntities } from "miniplex-react"
import { ECS } from "../state"

const withObject3D = ECS.world.with("object3d")

export default function () {
  const { entities } = useEntities(withObject3D)

  useFrame((_, dt) => {
    for (const { object3d } of entities) {
      object3d.rotation.x = object3d.rotation.y += dt
    }
  })

  return null
}
