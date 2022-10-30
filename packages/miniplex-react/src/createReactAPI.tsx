import { useConst } from "@hmans/use-const"
import { Bucket, IEntity, Predicate, World } from "@miniplex/core"
import React, {
  createContext,
  FunctionComponent,
  memo,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect
} from "react"
import { useEntities as useEntitiesGlobal } from "./hooks"
import { mergeRefs } from "./lib/mergeRefs"

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

export type EntityChildren<E> = ReactNode | ((entity: E) => ReactNode)

export const createReactAPI = <E extends IEntity>(world: World<E>) => {
  const EntityContext = createContext<E | null>(null)

  const useCurrentEntity = () => useContext(EntityContext)

  const useEntities = <D extends E>(predicate: Predicate<E, D>) =>
    useEntitiesGlobal(world.where(predicate))

  const RawEntity = <D extends E>({
    children: givenChildren,
    entity: givenEntity = {} as D,
    as: As
  }: {
    entity?: D
    children?: EntityChildren<D>
    as?: FunctionComponent<{ entity: D; children?: ReactNode }>
  }) => {
    const entity = useConst(() => givenEntity)

    /* Add the entity to the bucket represented by this component if it isn't already part of it. */
    useIsomorphicLayoutEffect(() => {
      if (world.has(entity)) return

      world.add(entity)
      return () => {
        world.remove(entity)
      }
    }, [world, entity])

    const children =
      typeof givenChildren === "function"
        ? givenChildren(entity)
        : givenChildren

    return (
      <EntityContext.Provider value={entity}>
        {As ? <As entity={entity}>{children}</As> : children}
      </EntityContext.Provider>
    )
  }

  const Entity = memo(RawEntity) as typeof RawEntity

  const EntitiesInList = <D extends E>({
    entities,
    ...props
  }: {
    entities: D[]
    children?: EntityChildren<D>
    as?: FunctionComponent<{ entity: D; children?: ReactNode }>
  }) => (
    <>
      {entities.map((entity) => (
        <Entity key={world.id(entity)} entity={entity} {...props} />
      ))}
    </>
  )

  const RawEntitiesInBucket = <D extends E>({
    bucket,
    ...props
  }: {
    bucket: Bucket<D>
    children?: EntityChildren<D>
    as?: FunctionComponent<{ entity: D; children?: ReactNode }>
  }) => (
    <EntitiesInList
      entities={useEntitiesGlobal(bucket).entities as D[]}
      {...props}
    />
  )

  const EntitiesInBucket = memo(
    RawEntitiesInBucket
  ) as typeof RawEntitiesInBucket

  const EntitiesInQuery = <D extends E>({
    where,
    ...props
  }: {
    where: Predicate<E, D>
    children?: EntityChildren<D>
    as?: FunctionComponent<{
      entity: D
      children?: ReactNode
    }>
  }) => <EntitiesInBucket bucket={useEntities(where)} {...props} />

  function Entities<D extends E>({
    in: source,
    ...props
  }: {
    in: Predicate<E, D> | Bucket<D> | D[]
    children?: EntityChildren<D>
    as?: FunctionComponent<{
      entity: D
      children?: ReactNode
    }>
  }): JSX.Element {
    if (source instanceof Bucket) {
      return <EntitiesInBucket bucket={source} {...props} />
    } else if (typeof source === "function") {
      return <EntitiesInQuery where={source} {...props} />
    } else {
      return <EntitiesInList entities={source} {...props} />
    }
  }

  const Component = <P extends keyof E>(props: {
    name: P
    value?: E[P]
    children?: ReactNode
  }) => {
    const entity = useContext(EntityContext)

    if (!entity) {
      throw new Error("<Component> must be a child of <Entity>")
    }

    /* Handle creation and removal of component with a value prop */
    useIsomorphicLayoutEffect(() => {
      if (props.value === undefined) return

      world.addComponent(entity, props.name, props.value)

      return () => {
        world.removeComponent(entity, props.name)
      }
    }, [entity, props.name])

    /* Handle updates to existing component */
    useIsomorphicLayoutEffect(() => {
      if (props.value === undefined) return
      entity[props.name] = props.value
    }, [entity, props.name, props.value])

    /* Handle setting of child value */
    if (props.children) {
      const child = React.Children.only(props.children) as ReactElement

      const children = React.cloneElement(child, {
        ref: mergeRefs([
          (child as any).ref,
          (object: E[P]) => {
            if (object) {
              world.addComponent(entity, props.name, object)
            } else {
              world.removeComponent(entity, props.name)
            }
          }
        ])
      })

      return <>{children}</>
    }

    return null
  }

  return {
    Component,
    Entity,
    Entities,
    useCurrentEntity,
    useEntities
  }
}
