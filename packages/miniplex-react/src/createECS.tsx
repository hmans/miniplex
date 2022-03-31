import React, {
  createContext,
  FC,
  useContext,
  memo,
  ReactNode,
  cloneElement,
  ReactElement,
  useRef,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle
} from "react"
import {
  UntypedEntity,
  IEntity,
  World,
  Tag,
  Query,
  EntityWith,
  MiniplexComponent,
  RegisteredEntity
} from "miniplex"
import { useConst, useRerender } from "@hmans/react-toolbox"

export function createECS<TEntity extends IEntity = UntypedEntity>() {
  const world = new World<TEntity>()

  const EntityContext = createContext<RegisteredEntity<TEntity>>(null!)

  /**
   * A React component to either create a new entity, or represent an existing entity so
   * it can be enhanced with additional components (see the <Component> component.)
   */
  const Entity = forwardRef<
    TEntity,
    {
      children?: ReactNode | ((entity: TEntity) => JSX.Element)
      entity?: RegisteredEntity<TEntity>
    }
  >(({ entity: existingEntity, children }, ref) => {
    /* Reuse the specified entity or create a new one */
    const entity = useConst<RegisteredEntity<TEntity>>(
      () => existingEntity ?? world.createEntity()
    )

    /* Apply ref */
    useImperativeHandle(ref, () => entity)

    /* If the entity was freshly created, manage its presence in the ECS world. */
    useLayoutEffect(() => {
      if (existingEntity) return
      return () => world.destroyEntity(entity)
    }, [entity])

    /* Provide a context with the entity so <Component> components can be wired up. */
    return (
      <EntityContext.Provider value={entity}>
        {typeof children === "function" ? children(entity) : children}
      </EntityContext.Provider>
    )
  })

  const MemoizedEntity: FC<{ entity: RegisteredEntity<TEntity> }> = memo(
    ({ entity, children }) => (
      <Entity entity={entity} key={entity.miniplex.id}>
        {typeof children === "function" ? children(entity) : children}
      </Entity>
    ),
    (a, b) => a.entity === b.entity
  )

  const Entities: FC<{
    children: ReactNode | ((entity: RegisteredEntity<TEntity>) => JSX.Element)
    entities: RegisteredEntity<TEntity>[]
  }> = ({ entities, children }) => {
    return (
      <>
        {entities.map((entity) => (
          <MemoizedEntity
            entity={entity}
            key={entity.miniplex.id}
            children={children}
          />
        ))}
      </>
    )
  }

  function Collection<TTag extends keyof TEntity>({
    initial = 0,
    tag,
    children
  }: {
    children:
      | ReactNode
      | ((entity: EntityWith<RegisteredEntity<TEntity>, TTag>) => JSX.Element)
    initial?: number
    tag: TTag
  }) {
    const { entities } = useArchetype(tag)

    useLayoutEffect(() => {
      /* When firing up, create the requested number of entities. */
      for (let i = 0; i < initial; i++) {
        const entity = world.createEntity()
        world.addComponent(entity, { [tag]: Tag } as any)
      }

      /* When shutting down, purge all entities in this collection. */
      return () => {
        const len = entities.length
        for (let i = len; i >= 0; i--) {
          world.destroyEntity(entities[i])
        }
      }
    }, [tag, initial])

    return <Entities entities={entities}>{children}</Entities>
  }

  /**
   * Return the current entity context.
   */
  function useEntity() {
    return useContext(EntityContext)
  }

  /**
   * Declaratively add a component to an entity.
   */
  function Component<K extends keyof TEntity, V = TEntity[K]>({
    name,
    data,
    children
  }: {
    name: K
    data?: V
    children?: ReactElement | ((entity: TEntity) => ReactElement)
  }) {
    const entity = useEntity()
    const ref = useRef<TEntity[K]>(null!)

    /* Warn the user that passing multiple children is not allowed. */
    if (children && Array.isArray(children)) {
      throw new Error("<Component> will only accept a single React child.")
    }

    useLayoutEffect(() => {
      world.addComponent(entity, { [name]: data ?? ref.current } as any)

      return () => {
        /* The entity might already have been destroyed, so let's check. */
        if ("id" in entity) {
          world.removeComponent(entity, name)
        }
      }
    }, [entity, name, data])

    return (
      <>
        {children &&
          cloneElement(
            typeof children === "function" ? children(entity) : children,
            { ref }
          )}
      </>
    )
  }

  /**
   * Return the entities of the specified archetype and subscribe this component
   * to it, making it re-render when entities are added to or removed from it.
   */
  function useArchetype(...query: Query<TEntity>) {
    const rerender = useRerender()
    const archetype = useConst(() => world.archetype(...query))

    useLayoutEffect(() => {
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
    world,
    useArchetype,
    useEntity,
    Entity,
    Component,
    MemoizedEntity,
    Entities,
    Collection
  }
}
