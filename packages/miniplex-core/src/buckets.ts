import { Bucket } from "@miniplex/bucket"
import { hasComponents, hasNoComponents } from "./predicates"
import { memoizeQuery } from "./queries"
import {
  ArchetypeQuery,
  ArchetypeWithoutQuery,
  ArchetypeWithQuery,
  Predicate,
  With
} from "./types"

/**
 * An entity-aware bucket providing methods for creating
 * derived buckets, and tracking the buckets derived from it.
 */
export class EntityBucket<E> extends Bucket<E> {
  buckets = new Set<EntityBucket<any>>()

  /**
   * Returns `true` if the given entity should be in this bucket. Child classes
   * should override this method to implement custom bucket logic.
   *
   * @param entity The entity to check for.
   * @returns `true` if this bucket wants the specified entity, `false` otherwise.
   */
  wants(entity: any): entity is E {
    return true
  }

  protected evaluate(entity: any, future = entity) {
    /* Accept or reject the entity */
    if (this.has(entity) && !this.wants(future)) {
      this.remove(entity)
    } else if (!this.has(entity) && this.wants(future)) {
      this.add(entity)
    }

    /* If the entity is still in this bucket, update derived buckets. */
    if (this.has(entity)) {
      for (const bucket of this.buckets) {
        bucket.evaluate(entity, future)
      }
    }
  }

  update(
    entity: E,
    update: Partial<E> | ((e: E) => void) | ((e: E) => Partial<E>)
  ) {
    const future = { ...entity }
    const change = typeof update === "function" ? update(future) : update
    if (change) Object.assign(future as {}, change)
    this.evaluate(entity, future)
  }

  addBucket<B extends EntityBucket<any>>(bucket: B) {
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

  where<D extends E>(predicate: Predicate<E, D>): Iterable<D> {
    let index = this.entities.length

    const next = () => {
      let value: D | undefined

      do {
        value = this.entities[--index] as D
      } while (value && !predicate(value))

      return { value, done: index < 0 }
    }

    return {
      [Symbol.iterator]() {
        return { next }
      }
    }
  }

  /* with */

  with<P extends keyof E>(...props: P[]): ArchetypeBucket<With<E, P>>
  with<D extends With<E, any>>(...props: (keyof D)[]): ArchetypeBucket<D>
  with<P extends keyof E>(...props: P[]) {
    return this.archetype(...props)
  }

  /* without */

  without<P extends keyof E>(...props: P[]): ArchetypeBucket<E>
  without<D extends E>(...props: (keyof D)[]): ArchetypeBucket<D>
  without<P extends keyof E>(...props: P[]) {
    return this.archetype({ without: props })
  }

  /* Predicate form */

  archetype<D extends E>(predicate: Predicate<E, D>): PredicateBucket<D>

  /* Query form */

  archetype<P extends keyof E>(
    query: ArchetypeWithQuery<E, P>
  ): ArchetypeBucket<With<E, P>>

  archetype<P extends keyof E>(
    query: ArchetypeWithoutQuery<E>
  ): ArchetypeBucket<E>

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
  constructor(public query: ArchetypeQuery<E, keyof E>) {
    super()
  }

  wants(entity: any): entity is E {
    return (
      hasComponents(entity, ...(this.query.with || [])) &&
      hasNoComponents(entity, ...(this.query.without || []))
    )
  }
}
