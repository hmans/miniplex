import { useConst } from "@hmans/use-const"
import { useRerender } from "@hmans/use-rerender"
import {
  ArchetypeEntity,
  EntityWith,
  IEntity,
  Query,
  RegisteredEntity,
  Tag,
  UntypedEntity,
  World
} from "miniplex"
import React, {
  cloneElement,
  createContext,
  forwardRef,
  memo,
  ReactElement,
  ReactNode,
  Ref,
  useContext,
  useImperativeHandle,
  useRef
} from "react"
import mergeRefs from "react-merge-refs"
import useIsomorphicLayoutEffect from "./isomorphicLayoutEffect"

type EntityChildren<T extends IEntity> =
  | ReactNode
  | ((entity: T) => JSX.Element)

export function createECS<Entity extends IEntity = UntypedEntity>(
  inWorld?: World<Entity>
) {
  const world = inWorld || new World<Entity>()

  const EntityContext = createContext<RegisteredEntity<Entity>>(null!)

  /**
   * Returns the current entity context.
   */
  const useEntity = () => useContext(EntityContext)

  /**
   * A React component to either create a new entity, or represent an existing entity so
   * it can be enhanced with additional components (see the <Component> component.)
   */
  const Entity = forwardRef(function <
    E extends RegisteredEntity<Entity>,
    C extends EntityChildren<E>
  >(
    {
      entity: existingEntity,
      children
    }: {
      entity?: E
      children?: C
    },
    ref: Ref<E>
  ) {
    const entity = useConst(() => existingEntity ?? world.createEntity({} as E))

    /* If the entity was freshly created, manage its presence in the ECS world. */
    useIsomorphicLayoutEffect(() => {
      return () => {
        if (!existingEntity) world.destroyEntity(entity)
      }
    }, [])

    /* Apply ref */
    useImperativeHandle(ref, () => entity as E)

    /* Provide a context with the entity so <Component> components can be wired up. */
    return (
      <EntityContext.Provider value={entity}>
        {typeof children === "function" ? children(entity as E) : children}
      </EntityContext.Provider>
    )
  })

  const MemoizedEntity = memo(Entity, (a, b) => a.entity === b.entity)

  /**
   * Takes an array of entities and renders the inner JSX (or function) once per entity,
   * memoizing the results.
   */
  function Entities<
    E extends RegisteredEntity<Entity>,
    C extends EntityChildren<E>
  >({ entities, children }: { entities: E[]; children: C }) {
    return (
      <>
        {entities.map((entity) => (
          <MemoizedEntity
            entity={entity}
            children={children as any}
            key={entity.__miniplex.id}
          />
        ))}
      </>
    )
  }

  /**
   * Reactively renders all entities that match the given archetype.
   */
  function ArchetypeEntities<
    Q extends Query<Entity>,
    C extends EntityChildren<ArchetypeEntity<Entity, Q>>
  >({ archetype, children }: { archetype: Q; children: C }) {
    const { entities } = useArchetype(...archetype)
    return <Entities entities={entities} children={children} />
  }

  function ManagedEntities<TTag extends keyof Entity>({
    initial = 0,
    tag,
    children
  }: {
    children: EntityChildren<EntityWith<RegisteredEntity<Entity>, TTag>>
    initial?: number
    tag: TTag
  }) {
    const { entities } = useArchetype(tag)

    useIsomorphicLayoutEffect(() => {
      /* When firing up, create the requested number of entities. */
      for (let i = 0; i < initial; i++) {
        world.createEntity({ [tag]: Tag } as Entity)
      }

      /* When shutting down, purge all entities in this collection. */
      return () => {
        for (let i = entities.length; i > 0; i--) {
          world.destroyEntity(entities[i - 1])
        }
      }
    }, [tag, initial])

    return (
      <Entities
        entities={entities}
        children={children as EntityChildren<RegisteredEntity<Entity>>}
      ></Entities>
    )
  }

  /**
   * Declaratively add a component to an entity.
   */
  function Component<K extends keyof Entity>({
    name,
    data,
    children
  }: {
    name: K
    data?: Entity[K]
    children?: ReactElement | ((entity: Entity) => ReactElement)
  }) {
    const entity = useEntity()
    const ref = useRef<Entity[K]>(null!)

    /* Warn the user that passing multiple children is not allowed. */
    if (children && Array.isArray(children)) {
      throw new Error("<Component> will only accept a single React child.")
    }

    useIsomorphicLayoutEffect(() => {
      world.addComponent(entity, name, data ?? (ref.current as any))

      return () => {
        if ("__miniplex" in entity) {
          world.removeComponent(entity, name)
        }
      }
    }, [entity, name, data])

    /* If no children are passed, we're done. */
    if (!children) return null

    const childElement =
      typeof children === "function" ? children(entity) : children

    return (
      <>
        {cloneElement(childElement, {
          ref: mergeRefs([ref, (childElement as any).ref])
        })}
      </>
    )
  }

  /**
   * Return the entities of the specified archetype and subscribe this component
   * to it, making it re-render when entities are added to or removed from it.
   */
  function useArchetype<Q extends Query<Entity>>(...query: Q) {
    const rerender = useRerender()
    const archetype = useConst(() => world.archetype(...query))

    useIsomorphicLayoutEffect(() => {
      archetype.onEntityAdded.add(rerender)
      archetype.onEntityRemoved.add(rerender)

      /* We need to rerender at least once, because other effects might have set up
         new entities before we had a chance to register our listeners. */
      rerender()

      return () => {
        archetype.onEntityAdded.remove(rerender)
        archetype.onEntityRemoved.remove(rerender)
      }
    }, [archetype])

    return archetype
  }

  return {
    Component,
    Entity,
    Entities,
    ArchetypeEntities,
    ManagedEntities,
    MemoizedEntity,
    useArchetype,
    useEntity,
    world
  }
}
