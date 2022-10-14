import { useConst } from "@hmans/use-const"
import { useLayoutEffect, useMemo } from "react"

export const useKeyboard = () => {
  const keys = useConst(() => new Set<string>())

  useLayoutEffect(() => {
    const down = (event: KeyboardEvent) => keys.add(event.code)
    const up = (event: KeyboardEvent) => keys.delete(event.code)

    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [])

  return useMemo(() => {
    const getKey = (key: string) => (keys.has(key) ? 1 : 0)
    const getAxis = (minKey: string, maxKey: string) =>
      getKey(maxKey) - getKey(minKey)

    return { getKey, getAxis }
  }, [])
}
