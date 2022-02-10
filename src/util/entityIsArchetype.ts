import { IEntity, Archetype } from "../ecs"

export const entityIsArchetype = <T extends IEntity>(entity: T, archetype: Archetype<T>) =>
  archetype.every((name) => name in entity)
