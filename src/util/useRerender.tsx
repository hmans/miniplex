import { useState } from "react"

export function useRerender() {
  const [_, setVersion] = useState(0)
  return () => {
    setVersion((v) => v + 1)
  }
}
