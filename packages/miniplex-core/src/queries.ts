import { Predicate } from "@miniplex/bucket"
import { IEntity, WithComponents } from "./types"
import { PredicateCache } from "./util/PredicateCache"

export const normalizeComponents = <E extends IEntity>(
  components: (keyof E)[]
) => [...new Set(components.sort().filter((c) => !!c && c !== ""))]

/* has */

const cache = new PredicateCache<string, Function>()

export const hasAll = <E extends IEntity, C extends keyof E>(
  ...components: C[]
) =>
  cache.get(
    JSON.stringify(["has", ...normalizeComponents<E>(components)]),
    (entity: E): entity is WithComponents<E, C> =>
      components.every((c) => entity[c] !== undefined)
  ) as Predicate<E, WithComponents<E, C>>

export const has = hasAll

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

/* Archetype Queries */

export type ArchetypeQuery<
  E extends IEntity,
  All extends keyof E,
  Any extends keyof E,
  None extends keyof E
> = {
  all: All[]
  some: Any[]
  none: None[]
}

const archetypeCache = new PredicateCache<string, Function>()

export function archetype<
  E extends IEntity,
  All extends keyof E,
  Any extends keyof E,
  None extends keyof E
>(query: ArchetypeQuery<E, All, Any, None>) {
  /* TODO: Normalize and deduplicate given query */
  const key = JSON.stringify(query)

  /* Return a predicate that checks if an entity matches the archetype query */
  return archetypeCache.get(key, function (entity: E): entity is WithComponents<
    E,
    All
  > {
    const all = query.all.every((c) => entity[c] !== undefined)
    const some =
      query.some.length === 0 || query.some.some((c) => entity[c] !== undefined)
    const none = query.none.every((c) => entity[c] === undefined)
    return all && some && none
  }) as Predicate<E, WithComponents<E, All>>
}
