import { useConst } from "@hmans/use-const"
import { useRerender } from "@hmans/use-rerender"
import React, {
  createContext,
  memo,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect
} from "react"
import {
  archetype,
  Bucket,
  EntityPredicate,
  EntityWith,
  id,
  IEntity
} from "miniplex"
import { mergeRefs } from "./lib/mergeRefs"

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

export type EntityChildren<E> =
  | ReactNode
  | ((props: { entity: E }) => ReactNode)

export const createComponents = <E extends IEntity>(bucket: Bucket<E>) => {
  const EntityContext = createContext<E | null>(null)

  const useCurrentEntity = () => useContext(EntityContext)

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
      if (bucket.has(entity)) return

      bucket.add(entity)
      return () => bucket.remove(entity)
    }, [bucket, entity])

    return (
      <EntityContext.Provider value={entity}>
        {typeof children === "function" ? children({ entity }) : children}
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
      typeof _bucket === "function" ? bucket.derive(_bucket) : _bucket

    const { entities } = useBucket(source)
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

    /* Handle setting of value */
    useIsomorphicLayoutEffect(() => {
      if (props.value === undefined) return

      /* We need to write this directly into the object because at this point,
      the entity might not yet be part of the bucket (since this effect will run
      before the one that will add it to the bucket, which would make the update
      call below a no-op). */
      entity[props.name] = props.value

      bucket.update(entity)
    }, [entity, props.name, props.value])

    /* Handle setting of child value */
    if (props.children) {
      const child = React.Children.only(props.children) as ReactElement

      const children = React.cloneElement(child, {
        ref: mergeRefs([
          (child as any).ref,
          (ref: E[P]) => {
            entity[props.name] = ref
            bucket.update(entity)
          }
        ])
      })

      return <>{children}</>
    }

    return null
  }

  return { Entity, Entities, Bucket, Archetype, Property, useCurrentEntity }
}

export const useBucket = <E extends IEntity>(bucket: Bucket<E>) => {
  const rerender = useRerender()

  useIsomorphicLayoutEffect(() => {
    bucket.onEntityAdded.addListener(rerender)
    bucket.onEntityRemoved.addListener(rerender)

    return () => {
      bucket.onEntityAdded.removeListener(rerender)
      bucket.onEntityRemoved.removeListener(rerender)
    }
  }, [])

  useIsomorphicLayoutEffect(rerender, [])

  return bucket
}
