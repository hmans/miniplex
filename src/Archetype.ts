import { entityIsArchetype } from "./util/entityIsArchetype"
import { ListenerRegistry } from "./util/ListenerRegistry"
import { ComponentName, IEntity } from "./World"

export type ArchetypeQuery<T extends IEntity> = {
  all?: ComponentName<T>[]
  any?: ComponentName<T>[]
  none?: ComponentName<T>[]
}

export class Archetype<T extends IEntity> {
  /** A list of entities belonging to this archetype. */
  public entities = new Array<T>()

  /** Listeners on this event are invoked when an entity is added to this archetype's index. */
  public onEntityAdded = new ListenerRegistry<(entity: T) => void>()

  /** Listeners on this event are invoked when an entity is removed from this archetype's index. */
  public onEntityRemoved = new ListenerRegistry<(entity: T) => void>()

  constructor(public query: ArchetypeQuery<T>) {}

  public indexEntity(entity: T) {
    const isArchetype = entityIsArchetype(entity, this.query)
    const pos = this.entities.indexOf(entity, 0)

    if (isArchetype && pos < 0) {
      this.entities.push(entity)
      this.onEntityAdded.invoke(entity)
    } else if (!isArchetype && pos >= 0) {
      this.entities.splice(pos, 1)
      this.onEntityRemoved.invoke(entity)
    }
  }

  public removeEntity(entity: T) {
    const pos = this.entities.indexOf(entity)
    if (pos >= 0) this.entities.splice(pos, 1)
  }
}
