import { useRerender } from "@hmans/use-rerender"
import { Bucket, Predicate } from "@miniplex/core"
import useIsomorphicLayoutEffect from "./isomorphicLayoutEffect"

export function useEntities<E>(source: Bucket<E>): Bucket<E>

export function useEntities<E, D extends E>(
  source: Bucket<E>,
  predicate: Predicate<E, D>
): Bucket<D>

export function useEntities<E, D extends E>(
  source: Bucket<E>,
  predicate?: Predicate<E, D>
) {
  const rerender = useRerender()

  const bucket = predicate ? source.where(predicate) : source

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
