import { IEntity, Query } from ".."
import { normalizeComponentList } from "./normalizeComponentList"

/**
 * Normalize an archetype by sorting the component names it references.
 */
export function normalizeQuery<T extends IEntity>(query: Query<T>): Query<T> {
  return normalizeComponentList(query)
}
