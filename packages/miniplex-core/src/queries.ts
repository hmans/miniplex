import { Predicate } from "@miniplex/bucket"
import { IEntity, WithComponents } from "./types"
import { PredicateCache } from "./util/PredicateCache"

export const normalizeComponents = <E extends IEntity>(
  components: (keyof E)[]
) => [...new Set(components.sort().filter((c) => !!c && c !== ""))]

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
  any: Any[]
  none: None[]
}

const archetypeCache = new PredicateCache<string, Function>()

export const normalizeQuery = <
  E extends IEntity,
  All extends keyof E,
  Any extends keyof E,
  None extends keyof E
>(
  query: Partial<ArchetypeQuery<E, All, Any, None>>
) =>
  ({
    all: query.all !== undefined ? normalizeComponents<E>(query.all) : [],
    any: query.any !== undefined ? normalizeComponents<E>(query.any) : [],
    none: query.none !== undefined ? normalizeComponents<E>(query.none) : []
  } as ArchetypeQuery<E, All, Any, None>)

export function archetype<E extends IEntity, All extends keyof E>(
  ...all: All[]
): Predicate<E, WithComponents<E, All>>

export function archetype<
  E extends IEntity,
  All extends keyof E,
  Any extends keyof E,
  None extends keyof E
>(
  partialQuery: Partial<ArchetypeQuery<E, All, Any, None>>
): Predicate<E, WithComponents<E, All>>

export function archetype<
  E extends IEntity,
  All extends keyof E,
  Any extends keyof E,
  None extends keyof E
>(
  partialQuery: Partial<ArchetypeQuery<E, All, Any, None>> | All,
  ...extra: All[]
) {
  if (typeof partialQuery !== "object") {
    return archetype<E, All, never, never>({ all: [partialQuery, ...extra] })
  }

  /* Normalize and deduplicate given query */
  const query = normalizeQuery(partialQuery)
  const key = JSON.stringify(query)

  /* Return a predicate that checks if an entity matches the archetype query */
  return archetypeCache.get(key, function (entity: E): entity is WithComponents<
    E,
    All
  > {
    const all = query.all.every((c) => entity[c] !== undefined)

    const some =
      query.any.length === 0 || query.any.some((c) => entity[c] !== undefined)

    const none = query.none.every((c) => entity[c] === undefined)

    return all && some && none
  }) as Predicate<E, WithComponents<E, All>>
}
