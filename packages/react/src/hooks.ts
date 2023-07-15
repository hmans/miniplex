import { useRerender } from "@hmans/use-rerender"
import { Bucket } from "miniplex"
import { useMemo } from "react"
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

function useOnceIfBucketVersionChanged(
  bucket: Bucket<any>,
  callback: Function
) {
  /* If the bucket version has changed since this component was initially rendered,
  immediately force a re-render. (This may happen because other layout effects spawn
  or destroy entities before the effects mounted above actually register their
  subscriptions. */
  const originalVersion = useMemo(() => bucket.version, [bucket])

  useIsomorphicLayoutEffect(() => {
    if (bucket.version !== originalVersion) callback()
  }, [bucket])
}
