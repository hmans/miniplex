import { useRerender } from "@hmans/use-rerender"
import { Bucket } from "miniplex"
import { useMemo } from "react"
import useIsomorphicLayoutEffect from "./isomorphicLayoutEffect"

/**
 * Subscribes to changes in the specified bucket, and re-renders the component
 * whenever entities are added to or removed from it.
 *
 * @param bucket The bucket to watch for changes
 * @returns The bucket passed in, for convenience
 */
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
  useOnceIfBucketVersionChanged(bucket, callback)

  useIsomorphicLayoutEffect(
    () => bucket.onEntityAdded.subscribe(callback),
    [bucket, callback]
  )
}

export function useOnEntityRemoved<E>(
  bucket: Bucket<E>,
  callback: (entity: E) => void
) {
  useOnceIfBucketVersionChanged(bucket, callback)

  useIsomorphicLayoutEffect(
    () => bucket.onEntityRemoved.subscribe(callback),
    [bucket, callback]
  )
}

/**
 * A utility function that will invoke the specified callback in a layout effect
 * if the version of the specified bucket has changed since the component was
 * initially rendered.
 *
 * This solves the problem of useEntities and similar callbacks registering their
 * bucket change callbacks in a layout effect, which can sometimes cause them to
 * miss entities being created or destroyed within the same render cycle (since
 * this will often also happen in layout effects.)
 *
 * @param bucket The bucket to watch for changes
 * @param callback The callback to invoke if the bucket version has changed
 */
function useOnceIfBucketVersionChanged(
  bucket: Bucket<any>,
  callback: Function
) {
  const originalVersion = useMemo(() => bucket.version, [bucket])

  useIsomorphicLayoutEffect(() => {
    if (bucket.version !== originalVersion) callback()
  }, [bucket])
}
