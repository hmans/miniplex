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
   * An internal map of entities to their positions in the `entities` array.
   * This is used to quickly find the position of an entity in the array.
   */
  private entityPositions = new Map<E, number>()

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
   * The event that is emitted when the bucket is cleared.
   */
  onCleared = new Event()

  /**
   * The event that is emitted when the bucket is being disposed.
   */
  onDisposed = new Event()

  /**
   * A cache of derived buckets. This is used to ensure that we don't create
   * multiple derived buckets for the same predicate.
   */
  derivedBuckets = new Map()

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
    return this.entityPositions.has(entity)
  }

  /**
   * Adds the entity to this bucket. If the entity is already in the bucket, it
   * does nothing.
   *
   * @param entity The entity to add.
   * @returns The entity that was added.
   */
  add(entity: E) {
    if (entity === undefined) return

    /* Add the entity if we don't already have it */
    if (!this.has(entity)) {
      this.entities.push(entity)
      this.entityPositions.set(entity, this.entities.length - 1)

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
    if (entity === undefined) return

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
    if (entity === undefined) return

    /* Only act if we know about the entity */
    if (this.has(entity)) {
      /* Remove entity from our list */
      const index = this.entityPositions.get(entity)!
      this.entityPositions.delete(entity)

      const other = this.entities[this.entities.length - 1]
      this.entities[index] = other
      this.entityPositions.set(other, index)

      this.entities.pop()

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

    this.onCleared.emit()
  }

  /**
   * Dispose of this bucket. This will remove all entities from the bucket, dispose of all
   * known derived buckets, and clear all event listeners.
   */
  dispose() {
    /* Emit onDisposed event */
    this.onDisposed.emit()

    /* Clear all state */
    this.derivedBuckets.clear()
    this.entities = []
    this.entityPositions.clear()
    this.onCleared.clear()
    this.onDisposed.clear()
    this.onEntityAdded.clear()
    this.onEntityRemoved.clear()
    this.onEntityTouched.clear()
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
    if (existingBucket) return existingBucket

    /* Create bucket */
    const bucket = new Bucket<D>()

    /* Add to cache */
    this.derivedBuckets.set(predicate, bucket)

    /* Add entities that match the predicate */
    for (const entity of this.entities) {
      if (predicate(entity)) {
        bucket.add(entity)
      }
    }

    /* Listen for new entities */
    bucket.onDisposed.addListener(
      this.onEntityAdded.addListener((entity) => {
        if (predicate(entity)) {
          bucket.add(entity)
        }
      })
    )

    /* Listen for removed entities */
    bucket.onDisposed.addListener(
      this.onEntityRemoved.addListener((entity) => {
        bucket.remove(entity as D)
      })
    )

    /* Listen for changed entities */
    bucket.onDisposed.addListener(
      this.onEntityTouched.addListener((entity) => {
        if (predicate(entity)) {
          bucket.add(entity) && bucket.touch(entity)
        } else {
          bucket.remove(entity as D)
        }
      })
    )

    /* React to this bucket being disposed */
    this.onDisposed.addListener(() => {
      bucket.dispose()
    })

    return bucket as Bucket<D>
  }
}
