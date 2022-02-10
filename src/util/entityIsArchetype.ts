import { IEntity, Archetype } from "../ecs"

export const entityIsArchetype = (entity: IEntity, archetype: Archetype) =>
  archetype.every((name) => name in entity)
