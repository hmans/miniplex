import { IEntity, Query } from "./types"

export function matches<E extends IEntity>(
  entity: E,
  query: Query<E>
): boolean {
  const all =
    query.all === undefined ||
    query.all.every((key) => entity[key] !== undefined)

  const any =
    query.any === undefined ||
    query.any.some((key) => entity[key] !== undefined)

  const none =
    query.none === undefined ||
    query.none.every((key) => entity[key] === undefined)

  return all && any && none
}
