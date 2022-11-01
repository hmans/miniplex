import { Bucket } from "@miniplex/bucket"
import { memoizeQuery } from "./queries"
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

    /* Process existing entities */
    for (const entity of this.entities) {
      if (bucket.wants(entity)) {
        bucket.add(entity)
      }
    }

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

  /* Predicate form */

  archetype<D extends E>(predicate: Predicate<E, D>): PredicateBucket<D>

  /* Query form */

  archetype<P extends keyof E>(
    query: ArchetypeQuery<E, P>
  ): ArchetypeBucket<With<E, P>>

  archetype<D extends With<E, any>>(
    query: ArchetypeQuery<E, any>
  ): ArchetypeBucket<D>

  /* Component name form */

  archetype<P extends keyof E>(...components: P[]): ArchetypeBucket<With<E, P>>

  archetype<D extends With<E, any>>(
    ...components: (keyof D)[]
  ): ArchetypeBucket<D>

  /* Implementation */

  archetype<P extends keyof E>(
    query: ArchetypeQuery<E, P> | P | Predicate<E, With<E, P>>,
    ...rest: P[]
  ) {
    /* Handle the function form */
    if (typeof query === "function") {
      for (const bucket of this.buckets) {
        if (bucket instanceof PredicateBucket && bucket.predicate === query) {
          return bucket
        }
      }

      return this.addBucket(new PredicateBucket(query))
    }

    /* Handle the string form */
    if (typeof query !== "object") {
      return this.archetype({ with: [query, ...rest] })
    }

    /* Find and return existing archetype bucket */
    const memoizedQuery = memoizeQuery(query)

    for (const bucket of this.buckets) {
      if (bucket instanceof ArchetypeBucket && bucket.query === memoizedQuery) {
        return bucket
      }
    }

    /* Create a new bucket */
    return this.addBucket(new ArchetypeBucket(memoizedQuery))
  }
}

/**
 * A bucket representing a subset of entities that satisfy
 * a given predicate.
 */
export class PredicateBucket<E> extends EntityBucket<E> {
  constructor(public predicate: Predicate<E, E>) {
    super()
  }

  wants(entity: any): entity is E {
    return this.predicate(entity)
  }
}

/**
 * A bucket representing a subset of entities that have a
 * specific set of components.
 */
export class ArchetypeBucket<E> extends EntityBucket<E> {
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
