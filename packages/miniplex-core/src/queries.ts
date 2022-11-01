import { ArchetypeQuery, Predicate } from "./types"
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
