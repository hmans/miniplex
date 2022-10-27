import { IEntity, IQuery, WithComponents } from "./types"

export const normalizeComponents = <E extends IEntity>(
  components: (keyof E)[]
) => [...new Set(components.sort().filter((c) => !!c && c !== ""))]

export const normalizeQuery = <E extends IEntity>(query: IQuery<E>) => ({
  all: query.all && normalizeComponents(query.all),
  any: query.any && normalizeComponents(query.any),
  none: query.none && normalizeComponents(query.none)
})

export const serializeQuery = <E extends IEntity>(query: IQuery<E>) =>
  JSON.stringify(query)

export function query<E extends IEntity, Q extends IQuery<E>>(
  query: Q
): (entity: E) => entity is WithComponents<E, Q["all"][number]> {
  /* TODO: memoize */

  const predicate = (
    entity: E
  ): entity is WithComponents<E, Q["all"][number]> => {
    const components = Object.keys(entity) as (keyof E)[]

    const all =
      query.all === undefined ||
      query.all.every((key) => components.includes(key))

    const any =
      query.any === undefined ||
      query.any.length === 0 ||
      query.any.some((key) => components.includes(key))

    const none =
      query.none === undefined ||
      query.none.every((key) => !components.includes(key))

    return all && any && none
  }

  return predicate
}
