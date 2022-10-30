import { useRerender } from "@hmans/use-rerender"
import { Bucket, Predicate } from "@miniplex/core"
import useIsomorphicLayoutEffect from "./isomorphicLayoutEffect"

export function useEntities<E>(bucket: Bucket<E>): Bucket<E> {
  const rerender = useRerender()

  useIsomorphicLayoutEffect(() => {
    bucket.onEntityAdded.add(rerender)
    bucket.onEntityRemoved.add(rerender)

    return () => {
      bucket.onEntityAdded.remove(rerender)
      bucket.onEntityRemoved.remove(rerender)
    }
  }, [rerender])

  useIsomorphicLayoutEffect(rerender, [])

  return bucket
}
