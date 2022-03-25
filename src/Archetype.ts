import { entityIsArchetype } from "./util/entityIsArchetype"
import { ListenerRegistry } from "./util/ListenerRegistry"
import { ComponentName, EntityWith, IEntity } from "./World"

/**
 * A query is an array of component names.
 */
export type Query<T extends IEntity> = ComponentName<T>[]

export class Archetype<TEntity extends IEntity, TQuery extends Query<TEntity> = Query<TEntity>> {
  /** A list of entities belonging to this archetype. */
  public entities = new Array<EntityWith<TEntity, TQuery[number]>>()

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
