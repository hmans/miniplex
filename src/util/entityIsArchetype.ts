import { Query } from ".."
import { IEntity } from "../World"

export function entityIsArchetype<T extends IEntity>(entity: T, query: Query<T>) {
  return query.every((name) => name in entity)
}
