import { Bucket } from "@miniplex/bucket"
import { ArchetypeQuery, Predicate, With } from "./types"

/**
 * An entity-aware bucket providing methods for creating
 * derived buckets, and tracking the buckets derived from it.
 */
export class EntityBucket<E> extends Bucket<E> {
  buckets = new Set<EntityBucket<any>>()

  wants(entity: any): entity is E {
    return true
  }

  addBucket(bucket: EntityBucket<any>) {
    this.buckets.add(bucket)

    this.onEntityAdded.add((e) => {
      if (bucket.wants(e)) {
        bucket.add(e)
      }
    })

    this.onEntityRemoved.add((e) => {
      if (bucket.has(e)) {
        bucket.remove(e)
      }
    })

    return bucket
  }

  archetype<P extends keyof E>(
    query: ArchetypeQuery<E, P>
  ): Archetype<With<E, P>> {
    /* TODO: find and return existing archetype bucket */

    /* Create a new bucket */
    const bucket = new Archetype(query) as Archetype<With<E, P>>
    this.addBucket(bucket)
    return bucket
  }
}

/**
 * A bucket representing a subset of entities that have a
 * specific set of components.
 */
export class Archetype<E> extends EntityBucket<E> {
  constructor(public query: ArchetypeQuery<any, any>) {
    super()
  }

  wants(entity: any): entity is E {
    const hasWith =
      this.query.with === undefined ||
      this.query.with.every((p) => entity[p] !== undefined)

    const hasWithout =
      this.query.without === undefined ||
      this.query.without.every((p) => entity[p] === undefined)

    return hasWith && hasWithout
  }
}
