import { IEntity, WithOptionalKeys, WithRequiredKeys } from "./types"

export const memoize = <A extends object, B>(
  store: WeakMap<A, B>,
  from: A,
  to: B
): B => {
  if (store.has(from)) return store.get(from)!
  store.set(from, to)
  return to
}

const stores = {
  not: new WeakMap<Function, Function>(),
  all: new WeakMap<string[], Function>()
}

export const not = <E extends IEntity>(predicate: (entity: E) => boolean) =>
  memoize(stores.not, predicate, (entity: E) => !predicate(entity))

export const all =
  <E extends IEntity, C extends keyof E>(...components: C[]) =>
  (entity: E): entity is WithRequiredKeys<E, C> =>
    components.every((c) => entity[c] !== undefined)

export const any =
  <E extends IEntity, C extends keyof E>(...components: C[]) =>
  (entity: E) =>
    components.some((c) => entity[c] !== undefined)

export const none =
  <E extends IEntity, C extends keyof E>(...components: C[]) =>
  (entity: E): entity is WithOptionalKeys<E, C> =>
    components.every((c) => entity[c] === undefined)
