import { ArchetypeQuery } from "../Archetype"
import { IEntity } from "../World"

export const entityIsArchetype = <T extends IEntity>(entity: T, query: ArchetypeQuery<T>) => {
  const { all, any, none } = query

  const result =
    (!none || !none.some((name) => name in entity)) &&
    (!any || any.some((name) => name in entity)) &&
    (!all || all.every((name) => name in entity))

  return result
}
