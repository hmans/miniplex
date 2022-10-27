import { Bucket } from "./Bucket"
import { IEntity, Query } from "./types"
import { World } from "./World"

/**
 * A bucket type that stores entities belonging to a specific archetype.
 * This archetype is expressed as a `Query` object, stored in the archetype's
 * `query` property.
 */
export class Archetype<E extends IEntity> extends Bucket<E> {
  constructor(public world: World<E>, public query: Query<E>) {
    super()
  }

  matchesEntity(entity: E): boolean {
    return this.matchesComponents(Object.keys(entity))
  }

  matchesComponents(components: (keyof E)[]): boolean {
    const all =
      this.query.all === undefined ||
      this.query.all.every((key) => components.includes(key))

    const any =
      this.query.any === undefined ||
      this.query.any.some((key) => components.includes(key))

    const none =
      this.query.none === undefined ||
      this.query.none.every((key) => !components.includes(key))

    return all && any && none
  }
}
