import { Bucket, Predicate } from "@miniplex/bucket"
import { With } from "./types"
import { PredicateCache } from "./util/PredicateCache"

const normalizeComponents = <E>(components: (keyof E)[]) => [
  ...new Set(components.sort().filter((c) => !!c && c !== ""))
]

/* not */

const notCache = new PredicateCache<Function, Function>()

export const not = <E, D extends E>(predicate: Predicate<E, D>) =>
  notCache.get(predicate, (entity: E) => !predicate(entity)) as Predicate<E, E>

/**
 * Returns a predicate that checks if an entity has the requested tag.
 */
export const tagged = <E>(tag: keyof E) => archetype(tag) as Predicate<any, E>

/* Archetype Queries */

export type ArchetypeQuery<E, P extends keyof E> = {
  with: P[]
  without: (keyof E)[]
}

const archetypeCache = new PredicateCache<string, Function>()

const normalizeQuery = <E, P extends keyof E>(
  query: Partial<ArchetypeQuery<E, P>>
) =>
  ({
    with: query.with !== undefined ? normalizeComponents<E>(query.with) : [],
    without:
      query.without !== undefined ? normalizeComponents<E>(query.without) : []
  } as ArchetypeQuery<E, P>)

export function archetype<E, P extends keyof E>(
  ...components: P[]
): Predicate<E, With<E, P>>

export function archetype<E, P extends keyof E>(
  partialQuery: Partial<ArchetypeQuery<E, P>>
): Predicate<E, With<E, P>>

export function archetype<E, P extends keyof E>(
  partialQuery: Partial<ArchetypeQuery<E, P>> | P,
  ...extra: P[]
) {
  if (typeof partialQuery !== "object") {
    return archetype<E, P>({ with: [partialQuery, ...extra] })
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

/* Experimental: getArchetype */

export function getArchetype<E, P extends keyof E>(
  source: Bucket<E>,
  ...components: P[]
) {
  return source.where(archetype(...components))
}
