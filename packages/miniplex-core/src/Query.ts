import { Bucket } from "@miniplex/bucket"
import { QueryPredicate, IEntity } from "./types"
import { World } from "./World"

export class Query<D extends E, E extends IEntity> extends Bucket<D> {
  constructor(public world: World<E>, public predicate: QueryPredicate<E, D>) {
    super()

    /* Import all entities that match our predicate */
    for (const entity of world) {
      if (predicate(entity)) {
        this.add(entity)
      }
    }

    /* Register with source */
    world.registerQuery(this)
  }
}
