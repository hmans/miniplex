import { ArchetypeQuery, Predicate, With } from "./types"
import { Memoizer } from "./util/Memoizer"

export const normalizeComponents = (components: any[]) => [
  ...new Set(components.sort().filter((c) => !!c && c !== ""))
]

/* not */

const notCache = new Memoizer<Function, Function>()

export const not = <E, D extends E>(predicate: Predicate<E, D>) =>
  notCache.get(predicate, (entity: E) => !predicate(entity)) as Predicate<E, E>

/* Archetype Queries */

export const normalizeQuery = (query: ArchetypeQuery<any, any>) =>
  ({
    with: query.with !== undefined ? normalizeComponents(query.with) : [],
    without:
      query.without !== undefined ? normalizeComponents(query.without) : []
  } as typeof query)

const queryCache = new Memoizer<string, ArchetypeQuery<any, any>>()

export const memoizeQuery = <Q extends ArchetypeQuery<any, any>>(query: Q) => {
  const normalizedQuery = normalizeQuery(query)
  const key = JSON.stringify(normalizedQuery)
  return queryCache.get(key, normalizedQuery) as Q
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
