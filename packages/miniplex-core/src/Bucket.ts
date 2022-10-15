import { Event } from "@hmans/event"
import { Predicate } from "./types"

/**
 * A bucket is a collection of entities. Entities can be added, removed, and
 * touched; the bucket exposes events for each of these operations.
 */
export class Bucket<E> {
  [Symbol.iterator]() {
    let index = this.entities.length

    return {
      next: () => {
        const value = this.entities[--index]
        return { value, done: index < 0 }
      }
    }
  }

  /** The entities in the bucket. */
  entities = new Array<E>()

  /**
   * A set of all entities known to this world. This is primarily used
   * internally to speed up lookups.
   */
  private entitiesSet = new Set<any>()

  /**
   * The event that is emitted when an entity is added to this bucket.
   */
  onEntityAdded = new Event<E>()

  /**
   * The event that is emitted when an entity is removed from this bucket.
   */
  onEntityRemoved = new Event<E>()

  /**
   * The event that is emitted when an entity is touched in this bucket.
   */
  onEntityTouched = new Event<E>()

  /**
   * A cache of derived buckets. This is used to ensure that we don't create
   * multiple derived buckets for the same predicate.
   */
  derivedBuckets = new WeakMap()

  /**
   * Returns the size of this bucket (the number of entities it contains).
   */
  get size() {
    return this.entities.length
  }

  /**
   * Returns true if this bucket is currently tracking the given entity.
   *
   * @param entity The entity to check for.
   * @returns True if the entity is being tracked.
   */
  has(entity: E) {
    return this.entitiesSet.has(entity)
  }

  /**
   * Adds the entity to this bucket. If the entity is already in the bucket, it
   * does nothing.
   *
   * @param entity The entity to add.
   * @returns The entity that was added.
   */
  add(entity: E) {
    /* Add the entity if we don't already have it */
    if (!this.has(entity)) {
      this.entities.push(entity)
      this.entitiesSet.add(entity)

      this.onEntityAdded.emit(entity)
    }

    return entity
  }

  /**
   * Touches the entity, signaling this bucket that the entity was updated, and should
   * be re-evaluated by any buckets derived from this one.
   *
   * @param entity The entity to touch.
   * @returns The entity that was touched.
   */
  touch(entity: E) {
    if (this.has(entity)) {
      this.onEntityTouched.emit(entity)
    }

    return entity
  }

  /**
   * Removes the entity from this bucket. If the entity is not in the bucket,
   * it does nothing.
   *
   * @param entity The entity to remove.
   * @returns The entity that was removed.
   */
  remove(entity: E) {
    /* Only act if we know about the entity */
    if (this.has(entity)) {
      /* Remove entity from our list */
      const index = this.entities.indexOf(entity)
      this.entities[index] = this.entities[this.entities.length - 1]
      this.entities.pop()
      this.entitiesSet.delete(entity)

      /* Emit event */
      this.onEntityRemoved.emit(entity)
    }

    return entity
  }

  /**
   * Removes all entities from this bucket. This will emit the `onEntityRemoved` event
   * for each entity, giving derived buckets a chance to remove the entity as well.
   */
  clear() {
    for (const entity of this) {
      this.remove(entity)
    }
  }

  /**
   * Create a new bucket derived from this bucket. The derived bucket will contain
   * only entities that match the given predicate, and will be updated reactively
   * as entities are added, removed, or touched.
   *
   * @param predicate The predicate to use to filter entities.
   * @returns The new derived bucket.
   */
  derive<D extends E = E>(
    predicate: Predicate<E, D> | ((entity: E) => boolean) = () => true
  ): Bucket<D> {
    /* Check if we already have a derived bucket for this predicate */
    const existingBucket = this.derivedBuckets.get(predicate)
    if (existingBucket) {
      return existingBucket
    }

    /* Create bucket */
    const bucket = new Bucket<D>()

    /* Add to cache */
    this.derivedBuckets.set(predicate, bucket)

    /* Add entities that match the predicate */
    for (const entity of this) {
      if (predicate(entity)) {
        bucket.add(entity)
      }
    }

    /* Listen for new entities */
    this.onEntityAdded.addListener((entity) => {
      if (predicate(entity)) {
        bucket.add(entity)
      }
    })

    /* Listen for removed entities */
    this.onEntityRemoved.addListener((entity) => {
      bucket.remove(entity as D)
    })

    /* Listen for changed entities */
    this.onEntityTouched.addListener((entity) => {
      if (predicate(entity)) {
        bucket.add(entity) && bucket.touch(entity)
      } else {
        bucket.remove(entity as D)
      }
    })

    return bucket as Bucket<D>
  }
}
