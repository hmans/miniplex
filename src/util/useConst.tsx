import { useRef } from "react"

export function useConst<T>(fn: () => T): T {
  const ref = useRef<T>()

  if (!ref.current) {
    ref.current = fn()
  }

  return ref.current
}
