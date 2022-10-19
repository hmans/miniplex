import { IEntity, WithOptionalKeys, WithRequiredKeys } from "./types"

type MemoizeStore<A extends Function, B extends Function> = WeakMap<A, B>

export const memoize = <A extends Function, B extends Function>(
  store: MemoizeStore<A, B>,
  from: A,
  to: B
): B => {
  if (store.has(from)) return store.get(from)!
  store.set(from, to)
  return to
}

const notStore = new WeakMap<Function, Function>()

export const not =
  <E extends IEntity>(predicate: (entity: E) => boolean) =>
  (entity: E): entity is E =>
    memoize(notStore, predicate, (entity: E) => !predicate(entity))(entity)

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
