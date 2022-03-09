import { useRef } from "react"

export function useData<T>(fn: () => T): T {
  const ref = useRef<T>()

  if (!ref.current) {
    ref.current = fn()
  }

  return ref.current
}
