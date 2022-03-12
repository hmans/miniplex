import { entityIsArchetype } from "./util/entityIsArchetype"
import { ListenerRegistry } from "./util/ListenerRegistry"
import { WithRequiredKeys } from "./util/types"
import { ComponentName, IEntity } from "./World"

export type Query<T extends IEntity> = ComponentName<T>[]

export type QueriedEntity<
  TEntity extends IEntity,
  TQuery extends Query<TEntity>
> = WithRequiredKeys<TEntity, TQuery[number]> & TEntity

export class Archetype<TEntity extends IEntity, TQuery extends Query<TEntity> = Query<TEntity>> {
  /** A list of entities belonging to this archetype. */
  public entities = new Array<QueriedEntity<TEntity, TQuery>>()

  /** Listeners on this event are invoked when an entity is added to this archetype's index. */
  public onEntityAdded = new ListenerRegistry<(entity: TEntity) => void>()

  /** Listeners on this event are invoked when an entity is removed from this archetype's index. */
  public onEntityRemoved = new ListenerRegistry<(entity: TEntity) => void>()

  constructor(public query: TQuery) {}

  public indexEntity(entity: TEntity) {
    const isArchetype = entityIsArchetype(entity, this.query)
    const pos = this.entities.indexOf(entity as any, 0)

    if (isArchetype && pos < 0) {
      this.entities.push(entity as any)
      this.onEntityAdded.invoke(entity)
    } else if (!isArchetype && pos >= 0) {
      this.entities.splice(pos, 1)
      this.onEntityRemoved.invoke(entity)
    }
  }

  public removeEntity(entity: TEntity) {
    const pos = this.entities.indexOf(entity as any, 0)
    if (pos >= 0) {
      this.entities.splice(pos, 1)
      this.onEntityRemoved.invoke(entity)
    }
  }
}
