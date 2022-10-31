import { Bucket, Predicate, World } from "@miniplex/core"
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

type AsComponent<E> = FunctionComponent<{
  entity: E
  children?: ReactNode
}>

type CommonProps<E> = {
  children?: EntityChildren<E>
  as?: AsComponent<E>
}

export const createReactAPI = <E,>(world: World<E>) => {
  const EntityContext = createContext<E | null>(null)

  const useCurrentEntity = () => useContext(EntityContext)

  const useEntities = <D extends E>(predicate: Predicate<E, D>) =>
    useEntitiesGlobal(world.where(predicate))

  const RawEntity = <D extends E>({
    children: givenChildren,
    entity = {} as D,
    as: As
  }: CommonProps<D> & {
    entity?: D
  }) => {
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
  }: CommonProps<D> & {
    entities: D[]
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
  }: CommonProps<D> & {
    bucket: Bucket<D>
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
  }: CommonProps<D> & {
    where: Predicate<E, D>
  }) => <EntitiesInBucket bucket={useEntities(where)} {...props} />

  function Entities<D extends E>({
    in: source,
    ...props
  }: CommonProps<D> & {
    in: Predicate<E, D> | Bucket<D> | D[]
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
      entity[props.name] = props.value as typeof entity[P]
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
    world,
    Component,
    Entity,
    Entities,
    useCurrentEntity,
    useEntities
  }
}
