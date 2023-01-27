import { useFrame } from "@react-three/fiber"
import { useMonitor } from "miniplex/react"
import { ECS } from "../state"

const withDestroy = ECS.world.with("destroy")

export const DestroySystem = () => {
  const monitor = useMonitor(withDestroy, (m) =>
    m.onAdd((entity) => {
      ECS.world.remove(entity)
    })
  )

  useFrame(() => {
    monitor.run()
  })

  return null
}
