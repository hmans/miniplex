import { useRerender } from "@hmans/use-rerender"
import { Bucket } from "@miniplex/core"
import useIsomorphicLayoutEffect from "./isomorphicLayoutEffect"

export function useEntities<T extends Bucket<any>>(bucket: T): T {
  const rerender = useRerender()

  useIsomorphicLayoutEffect(() => {
    bucket.onEntityAdded.subscribe(rerender)
    bucket.onEntityRemoved.subscribe(rerender)

    return () => {
      bucket.onEntityAdded.unsubscribe(rerender)
      bucket.onEntityRemoved.unsubscribe(rerender)
    }
  }, [rerender])

  useIsomorphicLayoutEffect(rerender, [])

  return bucket
}

export function useOnEntityAdded<E>(
  bucket: Bucket<E>,
  callback: (entity: E) => void
) {
  useIsomorphicLayoutEffect(
    () => bucket.onEntityAdded.subscribe(callback),
    [bucket, callback]
  )
}

export function useOnEntityRemoved<E>(
  bucket: Bucket<E>,
  callback: (entity: E) => void
) {
  useIsomorphicLayoutEffect(
    () => bucket.onEntityRemoved.subscribe(callback),
    [bucket, callback]
  )
}
