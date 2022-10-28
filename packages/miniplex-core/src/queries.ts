import { Predicate } from "@miniplex/bucket"
import { IEntity, WithComponents } from "./types"
import { PredicateCache } from "./util/PredicateCache"

export const normalizeComponents = <E extends IEntity>(
  components: (keyof E)[]
) => [...new Set(components.sort().filter((c) => !!c && c !== ""))]

export const normalizeQuery = <
  E extends IEntity,
  All extends keyof E,
  Any extends keyof E,
  None extends keyof E
>(
  query: ComponentQuery<E, All, Any, None>
) => ({
  all: query.all && normalizeComponents<E>(query.all),
  any: query.any && normalizeComponents<E>(query.any),
  none: query.none && normalizeComponents<E>(query.none)
})

export const serializeQuery = <E extends IEntity>(
  query: ComponentQuery<E, any, any, any>
) => JSON.stringify(query)

export type ComponentQuery<
  E extends IEntity,
  All extends keyof E,
  Any extends keyof E,
  None extends keyof E
> = {
  all: All[]
  any: Any[]
  none: None[]
}

/* has */

const cache = new PredicateCache<string, Function>()

export const has = <E extends IEntity, C extends keyof E>(...components: C[]) =>
  cache.get(
    JSON.stringify(["has", ...normalizeComponents<E>(components)]),
    (entity: E): entity is WithComponents<E, C> =>
      components.every((c) => entity[c] !== undefined)
  ) as Predicate<E, WithComponents<E, C>>

export const hasAll = has

export const hasSome = <E extends IEntity>(...components: (keyof E)[]) =>
  cache.get(
    JSON.stringify(["hasSome", ...normalizeComponents<E>(components)]),
    (entity: E) => components.some((c) => entity[c] !== undefined)
  ) as Predicate<E, E>

export const hasNone = <E extends IEntity>(...components: (keyof E)[]) =>
  cache.get(
    JSON.stringify(["hasNone", ...normalizeComponents<E>(components)]),
    (entity: E) => components.every((c) => entity[c] === undefined)
  ) as Predicate<E, E>

/* not */

const notCache = new PredicateCache<Function, Function>()

export const not = <E extends IEntity, D extends E>(
  predicate: Predicate<E, D>
) =>
  notCache.get(predicate, (entity: E) => !predicate(entity)) as Predicate<E, E>
