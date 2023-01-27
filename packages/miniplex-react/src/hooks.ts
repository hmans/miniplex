import { useRerender } from "@hmans/use-rerender"
import { Bucket, Monitor } from "@miniplex/core"
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

export function useMonitor<E>(
  bucket: Bucket<E>,
  builder: (monitor: Monitor<E>) => void
) {
  const monitor = useMemo(() => bucket.monitor(), [bucket, builder])

  useIsomorphicLayoutEffect(() => {
    builder(monitor)

    return () => {
      monitor.stop()
    }
  }, [monitor, bucket, builder])

  return monitor
}
