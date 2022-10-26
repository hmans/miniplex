import { IEntity, Query } from "./types"

export function entityMatches<E extends IEntity>(
  entity: E,
  query: Query<E>
): boolean {
  // const all =
  //   query.all === undefined ||
  //   query.all.every((key) => entity[key] !== undefined)

  // const any =
  //   query.any === undefined ||
  //   query.any.some((key) => entity[key] !== undefined)

  // const none =
  //   query.none === undefined ||
  //   query.none.every((key) => entity[key] === undefined)

  // return all && any && none

  return componentsMatch(Object.keys(entity), query)
}

export function componentsMatch<E extends IEntity>(
  components: (keyof E)[],
  query: Query<E>
): boolean {
  const all =
    query.all === undefined ||
    query.all.every((key) => components.includes(key))

  const any =
    query.any === undefined || query.any.some((key) => components.includes(key))

  const none =
    query.none === undefined ||
    query.none.every((key) => !components.includes(key))

  return all && any && none
}
