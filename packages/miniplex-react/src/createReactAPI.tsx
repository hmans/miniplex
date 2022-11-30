import { Bucket, World } from "@miniplex/core"
import React, {
  createContext,
  ForwardedRef,
  forwardRef,
  memo,
  PropsWithRef,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState
} from "react"
import { useEntities as useEntitiesGlobal } from "./hooks"
import { mergeRefs } from "./lib/mergeRefs"

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

export type EntityChildren<E> = ReactNode | ((entity: E) => ReactNode)

type CommonProps<E> = {
  children?: EntityChildren<E>
}

export const createReactAPI = <E extends {}>(world: World<E>) => {
  const EntityContext = createContext<E | null>(null)

  const useCurrentEntity = () => {
    const entity = useContext(EntityContext)

    if (!entity) {
      throw new Error(
        "useCurrentEntity must be called from a child of <Entity>."
      )
    }

    return entity
  }

  type EntityProps<D extends E> = CommonProps<D> & { entity?: D }

  const RawEntity = <D extends E>(
    { children: givenChildren, entity: givenEntity }: EntityProps<D>,
    ref: ForwardedRef<D>
  ) => {
    const [defaultEntity] = useState(() => ({} as D))
    const entity = givenEntity || defaultEntity

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

    useImperativeHandle(ref, () => entity)

    return (
      <EntityContext.Provider value={entity}>{children}</EntityContext.Provider>
    )
  }

  /* We need to typecast here because forwardRef doesn't support generics. */
  const Entity = memo(forwardRef(RawEntity)) as <D extends E>(
    props: PropsWithRef<EntityProps<D> & { ref?: ForwardedRef<D> }>
  ) => ReactElement

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
    Entities,
    useCurrentEntity
  }
}
