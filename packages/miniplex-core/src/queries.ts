import { IEntity, Query } from "./types"

export const normalizeComponents = <E extends IEntity>(
  components: (keyof E)[]
) => [...new Set(components.sort().filter((c) => !!c && c !== ""))]

export const normalizeQuery = <E extends IEntity>(query: Query<E>) => ({
  all: query.all && normalizeComponents(query.all),
  any: query.any && normalizeComponents(query.any),
  none: query.none && normalizeComponents(query.none)
})

export const serializeQuery = <E extends IEntity>(query: Query<E>) =>
  JSON.stringify(query)

export const all = <E>(...components: (keyof E)[]) => ({
  all: components
})
