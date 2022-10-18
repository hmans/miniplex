import { useConst } from "@hmans/use-const"
import { useLayoutEffect } from "react"
import { Vector3 } from "three"
import { ECS } from "../state"

export const MouseInput = () => {
  const data = useConst(() => ({
    point: new Vector3(),
    leftButton: false,
    rightButton: false
  }))

  useLayoutEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        data.leftButton = true
      } else if (event.button === 2) {
        data.rightButton = true
      }
    }

    const onMouseUp = (event: MouseEvent) => {
      if (event.button === 0) {
        data.leftButton = false
      } else if (event.button === 2) {
        data.rightButton = false
      }
    }

    const disableContextMenu = (event: MouseEvent) => {
      event.preventDefault()
    }

    document.addEventListener("mousedown", onMouseDown)
    document.addEventListener("mouseup", onMouseUp)
    document.addEventListener("contextmenu", disableContextMenu)

    return () => {
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("mouseup", onMouseUp)
      document.removeEventListener("contextmenu", disableContextMenu)
    }
  })

  return (
    <ECS.Entity>
      <ECS.Component name="mouseInput" value={data} />

      <mesh onPointerMove={(e) => data.point.copy(e.point)} visible={false}>
        <planeBufferGeometry args={[10000, 10000]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </ECS.Entity>
  )
}
