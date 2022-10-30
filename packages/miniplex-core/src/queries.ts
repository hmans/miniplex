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
  None extends keyof E
> = {
  with: All[]
  without: None[]
}

const archetypeCache = new PredicateCache<string, Function>()

const normalizeQuery = <
  E extends IEntity,
  With extends keyof E,
  Without extends keyof E
>(
  query: Partial<ArchetypeQuery<E, With, Without>>
) =>
  ({
    with: query.with !== undefined ? normalizeComponents<E>(query.with) : [],
    without:
      query.without !== undefined ? normalizeComponents<E>(query.without) : []
  } as ArchetypeQuery<E, With, Without>)

export function archetype<E extends IEntity, With extends keyof E>(
  ...components: With[]
): Predicate<E, WithComponents<E, With>>

export function archetype<
  E extends IEntity,
  With extends keyof E,
  Without extends keyof E
>(
  partialQuery: Partial<ArchetypeQuery<E, With, Without>>
): Predicate<E, WithComponents<E, With>>

export function archetype<
  E extends IEntity,
  With extends keyof E,
  Without extends keyof E
>(
  partialQuery: Partial<ArchetypeQuery<E, With, Without>> | With,
  ...extra: With[]
) {
  if (typeof partialQuery !== "object") {
    return archetype<E, With, never>({ with: [partialQuery, ...extra] })
  }

  /* Normalize and deduplicate given query */
  const query = normalizeQuery(partialQuery)

  /* Return a predicate that checks if an entity matches the archetype query */
  return archetypeCache.get(
    JSON.stringify(query),

    function (entity: E): entity is WithComponents<E, With> {
      return (
        query.with.every((c) => entity[c] !== undefined) &&
        query.without.every((c) => entity[c] === undefined)
      )
    }
  ) as Predicate<E, WithComponents<E, With>>
}
