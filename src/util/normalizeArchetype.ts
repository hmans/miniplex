import { IEntity, Query } from ".."
import normalizeComponentList from "./normalizeComponentList"

/**
 * Normalize an archetype by sorting the component names it references.
 */
function normalizeArchetype<T extends IEntity>(query: Query<T>): Query<T> {
  return normalizeComponentList(query)
}

export default normalizeArchetype
