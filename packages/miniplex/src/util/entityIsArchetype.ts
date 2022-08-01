import { Query, ArchetypeEntity } from "../Archetype"
import { IEntity } from "../World"

export function entityIsArchetype<
  TEntity extends IEntity,
  TQuery extends Query<TEntity>
>(entity: TEntity, query: TQuery): entity is ArchetypeEntity<TEntity, TQuery> {
  return query.every((name) => name in entity)
}
