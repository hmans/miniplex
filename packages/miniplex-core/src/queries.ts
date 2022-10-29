import { Predicate } from "@miniplex/bucket"
import { IEntity, WithComponents } from "./types"
import { PredicateCache } from "./util/PredicateCache"

const normalizeComponents = <E extends IEntity>(components: (keyof E)[]) => [
  ...new Set(components.sort().filter((c) => !!c && c !== ""))
]

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
  with: All[]
  any: Any[]
  without: None[]
}

const archetypeCache = new PredicateCache<string, Function>()

const normalizeQuery = <
  E extends IEntity,
  With extends keyof E,
  Any extends keyof E,
  Without extends keyof E
>(
  query: Partial<ArchetypeQuery<E, With, Any, Without>>
) =>
  ({
    with: query.with !== undefined ? normalizeComponents<E>(query.with) : [],
    any: query.any !== undefined ? normalizeComponents<E>(query.any) : [],
    without:
      query.without !== undefined ? normalizeComponents<E>(query.without) : []
  } as ArchetypeQuery<E, With, Any, Without>)

export function archetype<E extends IEntity, With extends keyof E>(
  ...components: With[]
): Predicate<E, WithComponents<E, With>>

export function archetype<
  E extends IEntity,
  With extends keyof E,
  Any extends keyof E,
  Without extends keyof E
>(
  partialQuery: Partial<ArchetypeQuery<E, With, Any, Without>>
): Predicate<E, WithComponents<E, With>>

export function archetype<
  E extends IEntity,
  With extends keyof E,
  Any extends keyof E,
  Without extends keyof E
>(
  partialQuery: Partial<ArchetypeQuery<E, With, Any, Without>> | With,
  ...extra: With[]
) {
  if (typeof partialQuery !== "object") {
    return archetype<E, With, never, never>({ with: [partialQuery, ...extra] })
  }

  /* Normalize and deduplicate given query */
  const query = normalizeQuery(partialQuery)

  /* Return a predicate that checks if an entity matches the archetype query */
  return archetypeCache.get(
    JSON.stringify(query),

    function (entity: E): entity is WithComponents<E, With> {
      const all = query.with.every((c) => entity[c] !== undefined)

      const some =
        query.any.length === 0 || query.any.some((c) => entity[c] !== undefined)

      const none = query.without.every((c) => entity[c] === undefined)

      return all && some && none
    }
  ) as Predicate<E, WithComponents<E, With>>
}
