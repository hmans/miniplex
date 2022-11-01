import { useRerender } from "@hmans/use-rerender"
import { Bucket } from "@miniplex/core"
import useIsomorphicLayoutEffect from "./isomorphicLayoutEffect"

export function useEntities<T extends Bucket<any>>(bucket: T): T {
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

export function useOnEntityAdded<E>(
  bucket: Bucket<E>,
  callback: (entity: E) => void
) {
  useIsomorphicLayoutEffect(
    () => bucket.onEntityAdded.add(callback),
    [bucket, callback]
  )
}

export function useOnEntityRemoved<E>(
  bucket: Bucket<E>,
  callback: (entity: E) => void
) {
  useIsomorphicLayoutEffect(
    () => bucket.onEntityRemoved.add(callback),
    [bucket, callback]
  )
}
