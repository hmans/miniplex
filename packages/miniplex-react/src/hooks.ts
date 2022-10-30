import { useRerender } from "@hmans/use-rerender"
import { archetype, Bucket, IEntity, World } from "@miniplex/core"
import useIsomorphicLayoutEffect from "./isomorphicLayoutEffect"

export const useEntities = <E extends IEntity>(bucket: Bucket<E>) => {
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

  return bucket.entities
}

export const useArchetype = <E extends IEntity, P extends keyof E>(
  world: World<E>,
  ...properties: P[]
) => useEntities(world.where(archetype(...properties)))
