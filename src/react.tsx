import { createContext, FC, useContext, useEffect, useState } from "react"
import { ArchetypeQueryOrComponentList, UntypedEntity, World } from "."
import { useRerender } from "./util/useRerender"
import { IEntity } from "./World"

/**
 * Create various React-specific hooks and components for your
 * Miniplex ECS instance.
 *
 * @param world An instance of a Miniplex ECS to use.
 */
export function createReactIntegration<T extends IEntity = UntypedEntity>(world: World<T>) {
  const EntityContext = createContext<T>(null!)

  /**
   *
   */
  const Entity: FC = ({ children }) => {
    const [entity] = useState<T>({} as T)

    useEffect(() => {
      world.addEntity(entity)
      return () => world.removeEntity(entity)
    }, [entity])

    /* Provide a context with the entity so <Component> components can be wired up. */
    return <EntityContext.Provider value={entity}>{children}</EntityContext.Provider>
  }

  /**
   * Return the current entity context.
   */
  function useEntity() {
    return useContext(EntityContext)
  }

  /**
   * Declarative declare a component on an entity.
   */
  function Component<K extends keyof T>({ name, data }: { name: K; data: T[K] }) {
    const entity = useEntity()

    useEffect(() => {
      world.addComponent(entity, name, data)
      return () => world.removeComponent(entity, name)
    }, [entity, name, data])

    return null
  }

  /**
   * Return the entities of the specified archetype and subscribe this component
   * to it, making it re-render when entities are added to or removed from it.
   */
  function useArchetype(...query: ArchetypeQueryOrComponentList<T>) {
    const rerender = useRerender()
    const archetype = world.createArchetype(...query)

    useEffect(() => {
      archetype.onEntityAdded.on(rerender)
      archetype.onEntityRemoved.on(rerender)

      return () => {
        archetype.onEntityAdded.off(rerender)
        archetype.onEntityRemoved.off(rerender)
      }
    }, [world, archetype])

    return archetype.entities
  }

  return { useArchetype, useEntity, Entity, Component }
}
