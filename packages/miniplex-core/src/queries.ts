import { Predicate } from "@miniplex/bucket"
import { With } from "./types"
import { PredicateCache } from "./util/PredicateCache"

const normalizeComponents = <E>(components: (keyof E)[]) => [
  ...new Set(components.sort().filter((c) => !!c && c !== ""))
]

/* not */

const notCache = new PredicateCache<Function, Function>()

export const not = <E, D extends E>(predicate: Predicate<E, D>) =>
  notCache.get(predicate, (entity: E) => !predicate(entity)) as Predicate<E, E>

/* Archetype Queries */

export type ArchetypeQuery<E, All extends keyof E, None extends keyof E> = {
  with: All[]
  without: None[]
}

const archetypeCache = new PredicateCache<string, Function>()

const normalizeQuery = <E, With extends keyof E, Without extends keyof E>(
  query: Partial<ArchetypeQuery<E, With, Without>>
) =>
  ({
    with: query.with !== undefined ? normalizeComponents<E>(query.with) : [],
    without:
      query.without !== undefined ? normalizeComponents<E>(query.without) : []
  } as ArchetypeQuery<E, With, Without>)

export function archetype<E, P extends keyof E>(
  ...components: P[]
): Predicate<E, With<E, P>>

export function archetype<E, P extends keyof E, N extends keyof E>(
  partialQuery: Partial<ArchetypeQuery<E, P, N>>
): Predicate<E, With<E, P>>

export function archetype<E, P extends keyof E, N extends keyof E>(
  partialQuery: Partial<ArchetypeQuery<E, P, N>> | P,
  ...extra: P[]
) {
  if (typeof partialQuery !== "object") {
    return archetype<E, P, never>({ with: [partialQuery, ...extra] })
  }

  /* Normalize and deduplicate given query */
  const query = normalizeQuery(partialQuery)

  /* Return a predicate that checks if an entity matches the archetype query */
  return archetypeCache.get(
    JSON.stringify(query),

    (entity: E): entity is With<E, P> =>
      hasComponents(entity, ...query.with) &&
      hasNoComponents(entity, ...query.without)
  )
}

export function isArchetype<E, P extends keyof E>(
  entity: E,
  ...components: P[]
): entity is With<E, P> {
  return hasComponents(entity, ...components)
}

export function hasComponents<E, C extends keyof E>(
  entity: E,
  ...components: C[]
): entity is With<E, C> {
  return components.every((c) => entity[c] !== undefined)
}

export function hasAnyComponents<E, C extends keyof E>(
  entity: E,
  ...components: C[]
): entity is With<E, C> {
  return components.some((c) => entity[c] !== undefined)
}

export function hasNoComponents<E, C extends keyof E>(
  entity: E,
  ...components: C[]
): entity is With<E, C> {
  return components.every((c) => entity[c] === undefined)
}
