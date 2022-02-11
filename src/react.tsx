import { useEffect } from "react"
import { ECS, UntypedEntity } from "."
import { ComponentName, createECS, IEntity } from "./ecs"
import { useRerender } from "./util/useRerender"

type ReactECS<T extends IEntity> = ECS<T> & { useArchetype: (...names: ComponentName<T>[]) => T[] }

export function makeECS<T extends IEntity = UntypedEntity>(): ReactECS<T> {
  const ecs = createECS<T>()

  function useArchetype(...names: ComponentName<T>[]) {
    const rerender = useRerender()
    const archetype = ecs.createArchetype(...names)

    useEffect(() => {
      ecs.listeners.archetypeChanged.get(archetype)!.on(rerender)
      return () => ecs.listeners.archetypeChanged.get(archetype)!.off(rerender)
    }, [ecs])

    return ecs.get(archetype)
  }

  return { ...ecs, useArchetype }
}
