import { IEntity, Predicate, WithOptionalKeys, WithRequiredKeys } from "./types"

export const memoize = <A, B>(
  store: A extends object ? Map<A, B> | WeakMap<A, B> : Map<A, B>,
  from: A,
  to: B
): B => {
  if (store.has(from)) return store.get(from)!
  store.set(from, to)
  return to
}

const stores = {
  not: new WeakMap<Function, Function>(),
  all: new Map<string, Function>()
}

export const not = <E extends IEntity>(predicate: (entity: E) => boolean) =>
  memoize(stores.not, predicate, (entity: E) => !predicate(entity))

export const all = <E extends IEntity, C extends keyof E>(
  ...components: C[]
) => {
  const normalizedProperties = components.sort().filter((c) => !!c && c !== "")
  const key = JSON.stringify(normalizedProperties)

  return memoize(stores.all, key, (entity: E) =>
    components.every((c) => entity[c] !== undefined)
  ) as Predicate<E, WithRequiredKeys<E, C>>
}

export const any =
  <E extends IEntity, C extends keyof E>(...components: C[]) =>
  (entity: E) =>
    components.some((c) => entity[c] !== undefined)

export const none =
  <E extends IEntity, C extends keyof E>(...components: C[]) =>
  (entity: E): entity is WithOptionalKeys<E, C> =>
    components.every((c) => entity[c] === undefined)
