import { useConst } from "@hmans/use-const"
import {
  archetype,
  Bucket,
  id,
  IEntity,
  Predicate,
  WithRequiredKeys,
  World
} from "@miniplex/core"
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
import { useArchetype as useArchetypeGlobal, useEntities } from "./hooks"
import { mergeRefs } from "./lib/mergeRefs"

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

export type EntityChildren<E> = ReactNode | ((entity: E) => ReactNode)

export const createComponents = <E extends IEntity>(world: World<E>) => {
  const EntityContext = createContext<E | null>(null)

  const useCurrentEntity = () => useContext(EntityContext)

  const useArchetype = <P extends keyof E>(...properties: P[]) =>
    useArchetypeGlobal(world, ...properties)

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

  const Entities = <D extends E>({
    entities,
    ...props
  }: {
    entities: D[]
    children?: EntityChildren<D>
    as?: FunctionComponent<{ entity: D; children?: ReactNode }>
  }) => (
    <>
      {entities.map((entity) => (
        <Entity key={id(entity)} entity={entity} {...props} />
      ))}
    </>
  )

  const Bucket = <D extends E>({
    bucket: _bucket,
    ...props
  }: {
    bucket: Bucket<D> | Predicate<E, D>
    children?: EntityChildren<D>
    as?: FunctionComponent<{ entity: D; children?: ReactNode }>
  }) => {
    const source =
      typeof _bucket === "function" ? world.derive(_bucket) : _bucket

    const entities = useEntities(source)
    return <Entities entities={entities} {...props} />
  }

  const Archetype = <A extends keyof E>({
    properties,
    ...props
  }: {
    properties: A[] | A
    children?: EntityChildren<WithRequiredKeys<E, A>>
    as?: FunctionComponent<{
      entity: WithRequiredKeys<E, A>
      children?: ReactNode
    }>
  }) => (
    <Bucket
      bucket={archetype(
        ...(Array.isArray(properties) ? properties : [properties])
      )}
      {...props}
    />
  )

  const Property = <P extends keyof E>(props: {
    name: P
    value?: E[P]
    children?: ReactNode
  }) => {
    const entity = useContext(EntityContext)

    if (!entity) {
      throw new Error("Property must be a child of Entity")
    }

    /* Handle creation and removal of property */
    useIsomorphicLayoutEffect(() => {
      if (props.value === undefined) return

      const added = world.addProperty(entity, props.name, props.value)
      const originalValue = entity[props.name]

      return () => {
        if (added) world.removeProperty(entity, props.name)
        else entity[props.name] = originalValue
      }
    }, [entity, props.name])

    /* Handle updates to existing property */
    useIsomorphicLayoutEffect(() => {
      if (props.value === undefined) return
      world.setProperty(entity, props.name, props.value)
    }, [entity, props.name, props.value])

    /* Handle setting of child value */
    if (props.children) {
      const child = React.Children.only(props.children) as ReactElement

      const children = React.cloneElement(child, {
        ref: mergeRefs([
          (child as any).ref,
          (ref: E[P]) => {
            world.addProperty(entity, props.name, ref)
          }
        ])
      })

      return <>{children}</>
    }

    return null
  }

  return {
    Entity,
    Entities,
    Bucket,
    Archetype,
    Property,
    useCurrentEntity,
    useArchetype
  }
}
