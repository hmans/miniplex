import { useRerender } from "@hmans/use-rerender"
import { Bucket } from "@miniplex/core"
import useIsomorphicLayoutEffect from "./isomorphicLayoutEffect"

export function useEntities<T extends Bucket<any>>(bucket: T): T {
  const rerender = useRerender()

  /* Re-render when entities are added or removed */
  useOnEntityAdded(bucket, rerender)
  useOnEntityRemoved(bucket, rerender)

  return bucket
}

export function useOnEntityAdded<E>(
  bucket: Bucket<E>,
  callback: (entity: E) => void
) {
  useIsomorphicLayoutEffect(
    () => bucket.onAdd.subscribe(callback),
    [bucket, callback]
  )
}

export function useOnEntityRemoved<E>(
  bucket: Bucket<E>,
  callback: (entity: E) => void
) {
  useIsomorphicLayoutEffect(
    () => bucket.onRemove.subscribe(callback),
    [bucket, callback]
  )
}
