import { Bucket } from "@miniplex/bucket"
import { IEntity, PredicateFunction } from "./types"
import { World } from "./World"

export class Predicate<D extends E, E extends IEntity> extends Bucket<D> {
  constructor(
    public world: World<E>,
    public predicate: PredicateFunction<E, D>
  ) {
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
