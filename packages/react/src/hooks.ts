import { useRerender } from "@hmans/use-rerender"
import { Bucket } from "miniplex"
import useIsomorphicLayoutEffect from "./isomorphicLayoutEffect"
import { useLayoutEffect, useMemo } from "react"

export function useEntities<T extends Bucket<any>>(bucket: T): T {
  const originalVersion = useMemo(() => bucket.version, [bucket])
  const rerender = useRerender()

  /* Re-render when entities are added or removed */
  useOnEntityAdded(bucket, rerender)
  useOnEntityRemoved(bucket, rerender)

  useLayoutEffect(() => {
    /* If the bucket version has changed since this component was initially rendered,
    immediately force a re-render. (This may happen because other layout effects spawn
    or destroy entities before the effects mounted above actually register their
    subscriptions. */
    if (bucket.version !== originalVersion) rerender()
  }, [bucket])

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
