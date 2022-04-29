import { useConst, useRerender } from "@hmans/react-toolbox"
import {
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
  FC,
  forwardRef,
  memo,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react"

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
    const [entity, setEntity] = useState<RegisteredEntity<TEntity>>(null!)

    /* Apply ref */
    useImperativeHandle(ref, () => entity)

    /* If the entity was freshly created, manage its presence in the ECS world. */
    useEffect(() => {
      const entity = existingEntity ?? world.createEntity()
      setEntity(entity)

      return () => {
        if (!existingEntity) world.destroyEntity(entity)
        setEntity(null!)
      }
    }, [])

    /* Provide a context with the entity so <Component> components can be wired up. */
    return (
      entity && (
        <EntityContext.Provider value={entity}>
          {typeof children === "function" ? children(entity) : children}
        </EntityContext.Provider>
      )
    )
  })

  const MemoizedEntity: FC<{
    children?: ReactNode | ((entity: RegisteredEntity<TEntity>) => JSX.Element)
    entity: RegisteredEntity<TEntity>
  }> = memo(
    ({ entity, children }) => (
      <Entity entity={entity} key={entity.__miniplex.id}>
        {typeof children === "function" ? children(entity) : children}
      </Entity>
    ),
    (a, b) => a.entity === b.entity
  )

  const Entities: FC<{
    children: ReactNode | ((entity: RegisteredEntity<TEntity>) => JSX.Element)
    entities: (RegisteredEntity<TEntity> | null)[]
  }> = ({ entities, children }) => {
    return (
      <>
        {entities.map(
          (entity) =>
            entity && (
              <MemoizedEntity
                entity={entity}
                key={entity.__miniplex.id}
                children={children}
              />
            )
        )}
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

    useEffect(() => {
      /* When firing up, create the requested number of entities. */
      for (let i = 0; i < initial; i++) {
        world.createEntity({ [tag]: Tag } as TEntity)
      }

      /* When shutting down, purge all entities in this collection. */
      return () => {
        for (let i = entities.length; i > 0; i--) {
          world.destroyEntity(entities[i - 1])
        }
      }
    }, [tag, initial])

    return <Entities entities={entities}>{children as any}</Entities>
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
    const entity = useContext(EntityContext)
    const ref = useRef<TEntity[K]>(null!)

    /* Warn the user that passing multiple children is not allowed. */
    if (children && Array.isArray(children)) {
      throw new Error("<Component> will only accept a single React child.")
    }

    useEffect(() => {
      world.addComponent(entity, { [name]: data ?? ref.current } as any)

      return () => {
        if ("__miniplex" in entity) {
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

  function TagComponent<K extends keyof TEntity>({ name }: { name: K }) {
    return Component({ name, data: Tag })
  }

  /**
   * Create a number of entities, defined through an optional entity factory,
   * and add/remove them to/from the world on mount/unmount.
   */
  function useEntities(count: number, entityFactory?: () => TEntity) {
    /* Create entity objects */
    const entities = useConst(() => {
      const entities = []
      for (let i = 0; i < count; i++) {
        entities.push(entityFactory?.())
      }
      return entities
    })

    /* Create/Destroy entities */
    useEffect(() => {
      for (const entity of entities) {
        world.createEntity(entity)
      }

      return () => {
        for (const entity of entities) {
          world.destroyEntity(entity as RegisteredEntity<TEntity>)
        }
      }
    })

    return entities
  }

  /**
   * Return a single entity and automatically add/remove it to/from the world.
   */
  function useEntity(entityFn?: () => TEntity) {
    return useEntities(1, entityFn)[0]
  }

  /**
   * Return the entities of the specified archetype and subscribe this component
   * to it, making it re-render when entities are added to or removed from it.
   */
  function useArchetype(...query: Query<TEntity>) {
    const rerender = useRerender()
    const archetype = useConst(() => world.archetype(...query))

    useEffect(() => {
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
    useEntities,
    Entity,
    Component,
    TagComponent,
    MemoizedEntity,
    Entities,
    Collection
  }
}
