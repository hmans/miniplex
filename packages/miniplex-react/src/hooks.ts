import { useRerender } from "@hmans/use-rerender"
import { Bucket, IEntity, World } from "miniplex"
import useIsomorphicLayoutEffect from "./isomorphicLayoutEffect"

export const useEntities = <E extends IEntity>(bucket: Bucket<E>) => {
  const rerender = useRerender()

  useIsomorphicLayoutEffect(() => {
    bucket.onEntityAdded.addListener(rerender)
    bucket.onEntityRemoved.addListener(rerender)

    return () => {
      bucket.onEntityAdded.removeListener(rerender)
      bucket.onEntityRemoved.removeListener(rerender)
    }
  }, [])

  useIsomorphicLayoutEffect(rerender, [])

  return bucket.entities
}

export const useArchetype = <E extends IEntity, P extends keyof E>(
  world: World<E>,
  ...properties: P[]
) => useEntities(world.archetype(...properties))
