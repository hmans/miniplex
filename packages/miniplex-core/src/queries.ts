import { ArchetypeQuery } from "./types"

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
