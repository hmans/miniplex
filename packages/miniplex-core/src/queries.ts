import { ArchetypeQuery } from "./types"
import { Memoizer } from "./util/Memoizer"

export const normalizeComponents = (components: any[]) => [
  ...new Set(components.sort().filter((c) => !!c && c !== ""))
]

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
