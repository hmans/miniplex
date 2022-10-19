import { Event } from "@hmans/event"
import { archetype, isArchetype } from "./archetypes"
import { IEntity, Predicate, WithOptionalKeys, WithRequiredKeys } from "./types"

export type BucketOptions<E extends IEntity> = {
  entities?: E[]
}

/**
 * A bucket is a collection of entities. Entities can be added, removed, and
 * touched; the bucket exposes events for each of these operations.
 */
export class Bucket<E extends IEntity> {
  [Symbol.iterator]() {
    let index = this.entities.length

    return {
      next: () => {
        const value = this.entities[--index]
        return { value, done: index < 0 }
      }
    }
  }

  constructor({ entities = [] }: BucketOptions<E> = {}) {
    this.entities = entities
  }

  /** The entities in the bucket. */
  entities: E[]

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
  add<D extends E>(entity: D): E & D {
    /* Add the entity if we don't already have it */
    if (entity && !this.has(entity)) {
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
    if (entity && this.has(entity)) {
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
    if (entity && this.has(entity)) {
      /* Remove entity from our list */
      const index = this.entityPositions.get(entity)!
      this.entityPositions.delete(entity)

      const other = this.entities[this.entities.length - 1]

      if (other !== entity) {
        this.entities[index] = other
        this.entityPositions.set(other, index)
      }

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
  derive<D extends E>(
    predicate: Predicate<E, D> | ((entity: E) => boolean)
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
    bucket.onDisposed.add(
      this.onEntityAdded.add((entity) => {
        if (predicate(entity)) {
          bucket.add(entity)
        }
      })
    )

    /* Listen for removed entities */
    bucket.onDisposed.add(
      this.onEntityRemoved.add((entity) => {
        bucket.remove(entity as D)
      })
    )

    /* Listen for changed entities */
    bucket.onDisposed.add(
      this.onEntityTouched.add((entity) => {
        if (predicate(entity)) {
          bucket.add(entity)
          bucket.touch(entity)
        } else {
          bucket.remove(entity as D)
        }
      })
    )

    /* React to this bucket being disposed */
    this.onDisposed.add(() => {
      bucket.dispose()
    })

    return bucket as Bucket<D>
  }

  with<D extends E>(
    predicate: Predicate<E, D> | ((entity: E) => boolean)
  ): Bucket<D>

  with<D extends WithRequiredKeys<E, K>, K extends keyof E>(
    component: K,
    ...rest: K[]
  ): Bucket<D>

  with<D extends WithRequiredKeys<E, K>, K extends keyof E>(
    predicate: K | Predicate<E, D> | ((entity: E) => boolean),
    ...rest: K[]
  ) {
    if (typeof predicate === "string") {
      return this.derive(all(predicate, ...rest))
    } else if (typeof predicate === "function") {
      return this.derive(predicate)
    } else {
      throw new Error("Invalid predicate")
    }
  }

  without<D extends E>(predicate: (entity: E) => boolean): Bucket<E>

  without<K extends keyof E>(component: K, ...rest: K[]): Bucket<E>

  without<K extends keyof E>(
    predicate: K | ((entity: E) => boolean),
    ...rest: K[]
  ) {
    if (typeof predicate === "string") {
      return this.derive(none(predicate, ...rest))
    } else if (typeof predicate === "function") {
      return this.derive(not(predicate))
    } else {
      throw new Error("Invalid predicate")
    }
  }
}

type MemoizeStore<A extends Function, B extends Function> = WeakMap<A, B>

export const memoize = <A extends Function, B extends Function>(
  store: MemoizeStore<A, B>,
  from: A,
  to: B
): B => {
  if (store.has(from)) return store.get(from)!
  store.set(from, to)
  return to
}

const notStore = new WeakMap<Function, Function>()

export const not =
  <E extends IEntity>(predicate: (entity: E) => boolean) =>
  (entity: E): entity is E =>
    memoize(notStore, predicate, (entity: E) => !predicate(entity))(entity)

export const all =
  <E extends IEntity, C extends keyof E>(...components: C[]) =>
  (entity: E): entity is WithRequiredKeys<E, C> =>
    components.every((c) => entity[c] !== undefined)

export const any =
  <E extends IEntity, C extends keyof E>(...components: C[]) =>
  (entity: E) =>
    components.some((c) => entity[c] !== undefined)

export const none =
  <E extends IEntity, C extends keyof E>(...components: C[]) =>
  (entity: E): entity is WithOptionalKeys<E, C> =>
    components.every((c) => entity[c] === undefined)
