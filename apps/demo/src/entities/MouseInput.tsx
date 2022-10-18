import { useConst } from "@hmans/use-const"
import { Vector3 } from "three"
import { ECS } from "../state"

export const MouseInput = () => {
  const point = useConst(() => new Vector3())

  return (
    <ECS.Entity>
      <ECS.Component name="mouseInput" value={{ point }} />

      <mesh onPointerMove={(e) => point.copy(e.point)}>
        <planeBufferGeometry args={[10000, 10000]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </ECS.Entity>
  )
}
