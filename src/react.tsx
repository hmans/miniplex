import { createContext, FC, useContext, useEffect, useState } from "react"
import { ECS, UntypedEntity } from "."
import { ComponentName, IEntity } from "./ecs"
import { useRerender } from "./util/useRerender"

/**
 * Create various React-specific hooks and components for your
 * Miniplex ECS instance.
 *
 * @param ecs An instance of a Miniplex ECS to use.
 */
export function createReactIntegration<T extends IEntity = UntypedEntity>(ecs: ECS<T>) {
  function useArchetype(...names: ComponentName<T>[]) {
    const rerender = useRerender()
    const archetype = ecs.createArchetype(...names)

    useEffect(() => {
      ecs.listeners.archetypeChanged.get(archetype)!.on(rerender)
      return () => ecs.listeners.archetypeChanged.get(archetype)!.off(rerender)
    }, [ecs])

    return ecs.get(archetype)
  }

  const EntityContext = createContext<T>(null!)

  const Entity: FC = ({ children }) => {
    const [entity] = useState<T>(() => ({} as T))

    useEffect(() => {
      ecs.addEntity(entity)
      return () => ecs.removeEntity(entity)
    }, [entity])

    return <EntityContext.Provider value={entity}>{children}</EntityContext.Provider>
  }

  function Component<K extends keyof T>({ name, data }: { name: K; data: T[K] }) {
    const entity = useContext(EntityContext)

    useEffect(() => {
      ecs.addComponent(entity, name, data)
      return () => ecs.removeComponent(entity, name)
    }, [entity, name, data])

    return null
  }

  return { ...ecs, useArchetype, Entity, Component }
}
