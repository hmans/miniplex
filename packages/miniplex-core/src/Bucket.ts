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
   * Returns true if this bucket is currently tracking the given entity.
   * @param entity The entity to check for.
   * @returns True if the entity is being tracked.
   */
  has(entity: E) {
    return this.entities.includes(entity)
  }

  /**
   * Adds the entity to this bucket. If the entity is already in the bucket, it
   * does nothing.
   *
   * @param entity The entity to add.
   * @returns The entity that was added.
   */
  add(entity: E) {
    const index = this.entities.indexOf(entity)

    /* Add the entity if we don't already have it */
    if (index === -1) {
      this.entities.push(entity)
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
    const index = this.entities.indexOf(entity)

    if (index !== -1) {
      /* Emit an event if the entity changed */
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
    const index = this.entities.indexOf(entity)
    if (index === -1) return

    /* Remove entity from our list */
    this.entities[index] = this.entities[this.entities.length - 1]
    this.entities.pop()

    /* Emit event */
    this.onEntityRemoved.emit(entity)
  }

  /**
   * Removes all entities from this bucket. This will emit the `onEntityRemoved` event
   * for each entity, giving derived buckets a chance to remove the entity as well.
   */
  clear() {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      this.remove(this.entities[i])
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
    if (this.derivedBuckets.has(predicate)) {
      return this.derivedBuckets.get(predicate)
    }

    /* Create bucket */
    const bucket = new Bucket<D>()

    /* Add to cache */
    this.derivedBuckets.set(predicate, bucket)

    /* Add entities that match the predicate */
    for (const entity of this.entities)
      if (predicate(entity)) bucket.add(entity)

    /* Listen for new entities */
    this.onEntityAdded.addListener((entity) => {
      if (predicate(entity)) bucket.add(entity)
    })

    /* Listen for removed entities */
    this.onEntityRemoved.addListener((entity) => {
      bucket.remove(entity as D)
    })

    /* Listen for changed entities */
    this.onEntityTouched.addListener((entity) => {
      if (predicate(entity)) bucket.add(entity) && bucket.touch(entity)
      else bucket.remove(entity as D)
    })

    return bucket as Bucket<D>
  }
}