import { Bucket, With, World } from "@miniplex/core"
import React, {
  createContext,
  FunctionComponent,
  memo,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef
} from "react"
import { useEntities as useEntitiesGlobal } from "./hooks"
import { mergeRefs } from "./lib/mergeRefs"

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

export type EntityChildren<E> = JSX.Element | FunctionComponent<E>

type CommonProps<E> = {
  children?: EntityChildren<E>
}

export const createReactAPI = <E,>(world: World<E>) => {
  const EntityContext = createContext<E | null>(null)

  const useCurrentEntity = () => useContext(EntityContext)

  const RawEntity = <D extends E>({
    children: givenChildren,
    entity = {} as D
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
      <EntityContext.Provider value={entity}>{children}</EntityContext.Provider>
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

  function Entities<D extends E>({
    in: source,
    ...props
  }: CommonProps<D> & {
    in: Bucket<D> | D[]
  }): JSX.Element {
    if (source instanceof Bucket) {
      return <EntitiesInBucket bucket={source} {...props} />
    } else {
      return <EntitiesInList entities={source} {...props} />
    }
  }

  function Archetype<P extends keyof E>({
    with: _with,
    without,
    ...props
  }: CommonProps<With<E, P>> & {
    with?: P | P[]
    without?: keyof E | (keyof E)[]
  }) {
    const query = useMemo(
      () => ({
        with: _with ? (Array.isArray(_with) ? _with : [_with]) : undefined,
        without: without
          ? Array.isArray(without)
            ? without
            : [without]
          : undefined
      }),
      [_with, without]
    )

    const bucket = useMemo(() => world.archetype(query), [world, query])

    return <EntitiesInBucket {...props} bucket={bucket} />
  }

  const Component = <P extends keyof E>(props: {
    name: P
    data?: E[P]
    children?: ReactNode
  }) => {
    const entity = useContext(EntityContext)
    const ref = useRef<E[P]>(null!)

    if (!entity) {
      throw new Error("<Component> must be a child of <Entity>")
    }

    /* Handle creation and removal of component with a value prop */
    useIsomorphicLayoutEffect(() => {
      world.addComponent(entity, props.name, props.data || ref.current)
      return () => world.removeComponent(entity, props.name)
    }, [entity, props.name])

    /* Handle updates to existing component */
    useIsomorphicLayoutEffect(() => {
      if (props.data === undefined) return
      entity[props.name] = (props.data || ref.current) as typeof entity[P]
    }, [entity, props.name, props.data, ref.current])

    /* Handle setting of child value */
    if (props.children) {
      const child = React.Children.only(props.children) as ReactElement

      return React.cloneElement(child, {
        ref: mergeRefs([(child as any).ref, ref])
      })
    }

    return null
  }

  return {
    world,
    Component,
    Entity,
    Archetype,
    Entities,
    useCurrentEntity
  }
}
