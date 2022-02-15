import { IEntity, Archetype } from "../ecs"

export const entityIsArchetype = <T extends IEntity>(entity: T, archetype: Archetype<T>) => {
  const { all, any, none } = archetype

  const result =
    (!none || !none.some((name) => name in entity)) &&
    (!any || any.some((name) => name in entity)) &&
    (!all || all.every((name) => name in entity))

  return result
}
