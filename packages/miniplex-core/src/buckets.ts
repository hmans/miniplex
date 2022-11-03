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

  /**
   * Evaluates the given entity (`entity`) to check if it should be in this bucket or not.
   * The entity will be added or removed from this bucket as necessary.
   *
   * If you pass a second argument (`future`) into this function, it will be used
   * for these checks instead of the entity itself. This is useful in sutations
   * where you're about to make a destructive change to the entity, and want to
   * give archetype callbacks a chance to run with the entity intact before actually
   * making the change.
   *
   * @param entity The entity that is being evaluated.
   * @param future An optional future version of the entity that is used in the check.
   */
  evaluate(entity: E, future = entity) {
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

      const bucket = new PredicateBucket(this, query)
      this.buckets.add(bucket)
      return bucket
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
    const bucket = new ArchetypeBucket(this, memoizedQuery)
    this.buckets.add(bucket)
    return bucket
  }
}

export abstract class DerivedEntityBucket<E> extends EntityBucket<E> {
  constructor(public source: Bucket<any>) {
    super()
  }

  protected startUpdating() {
    this.source.onEntityAdded.add((e) => {
      if (this.wants(e)) this.add(e)
    })

    this.source.onEntityRemoved.add((e) => {
      this.remove(e)
    })

    this.update()
  }

  update() {
    for (const entity of this.source) {
      this.evaluate(entity)
    }
  }
}

/**
 * A bucket representing a subset of entities that satisfy
 * a given predicate.
 */
export class PredicateBucket<E> extends DerivedEntityBucket<E> {
  [Symbol.iterator]() {
    this.update()
    let index = this.entities.length

    return {
      next: () => {
        const value = this.entities[--index]
        return { value, done: index < 0 }
      }
    }
  }

  constructor(public source: Bucket<any>, public predicate: Predicate<E, E>) {
    super(source)

    /* Perform an initial update. */
    this.update()
  }

  wants(entity: any): entity is E {
    return this.predicate(entity)
  }
}

/**
 * A bucket representing a subset of entities that have a
 * specific set of components.
 */
export class ArchetypeBucket<E> extends DerivedEntityBucket<E> {
  constructor(
    public source: Bucket<any>,
    public query: ArchetypeQuery<E, keyof E>
  ) {
    super(source)
    this.startUpdating()
  }

  wants(entity: any): entity is E {
    return (
      hasComponents(entity, ...(this.query.with || [])) &&
      hasNoComponents(entity, ...(this.query.without || []))
    )
  }
}
