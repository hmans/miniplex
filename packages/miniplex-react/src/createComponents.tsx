import { useConst } from "@hmans/use-const"
import {
  archetype,
  Bucket,
  EntityPredicate,
  EntityWith,
  id,
  IEntity,
  World
} from "miniplex"
import React, {
  createContext,
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
    children,
    entity: givenEntity = {} as D
  }: {
    entity?: D
    children?: EntityChildren<D>
  }) => {
    const entity = useConst(() => givenEntity)

    /* Add the entity to the bucket represented by this component if it isn't already part of it. */
    useIsomorphicLayoutEffect(() => {
      if (world.has(entity)) return

      world.add(entity)
      return () => world.remove(entity)
    }, [world, entity])

    return (
      <EntityContext.Provider value={entity}>
        {typeof children === "function" ? children(entity) : children}
      </EntityContext.Provider>
    )
  }

  const Entity = memo(RawEntity) as typeof RawEntity

  const Entities = <D extends E>({
    entities,
    children
  }: {
    entities: D[]
    children?: EntityChildren<D>
  }) => (
    <>
      {entities.map((entity) => (
        <Entity key={id(entity)} entity={entity} children={children} />
      ))}
    </>
  )

  const Bucket = <D extends E>({
    bucket: _bucket,
    children
  }: {
    bucket: Bucket<D> | EntityPredicate<E, D>
    children?: EntityChildren<D>
  }) => {
    const source =
      typeof _bucket === "function" ? world.derive(_bucket) : _bucket

    const entities = useEntities(source)
    return <Entities entities={entities} children={children} />
  }

  const Archetype = <A extends keyof E>({
    properties,
    children
  }: {
    properties: A[] | A
    children?: EntityChildren<EntityWith<E, A>>
  }) => (
    <Bucket
      bucket={archetype(
        ...(Array.isArray(properties) ? properties : [properties])
      )}
      children={children}
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

      world.addProperty(entity, props.name, props.value)
      return () => world.removeProperty(entity, props.name)
    }, [entity, props.name])

    /* Handle updates to existing property */
    useIsomorphicLayoutEffect(() => {
      if (props.value === undefined) return

      entity[props.name] = props.value
      world.touch(entity)
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
