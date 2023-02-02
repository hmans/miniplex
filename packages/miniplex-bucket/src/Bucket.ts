import { Event } from "eventery"

/**
 * A class wrapping an array of entities of a specific type, providing
 * performance-optimized methods for adding, looking up and removing entities, and events
 * for when entities are added or removed.
 */
export class Bucket<E> implements Iterable<E> {
  get entities() {
    return this._entities
  }

  /* Custom iterator that iterates over all entities in reverse order. */
  [Symbol.iterator]() {
    let index = this._entities.length

    const result = {
      value: undefined as E,
      done: false
    }

    return {
      next: () => {
        result.value = this._entities[--index]
        result.done = index < 0
        return result
      }
    }
  }

  constructor(protected _entities: E[] = []) {
    this.add = this.add.bind(this)
    this.remove = this.remove.bind(this)

    /* Register all entity positions */
    for (let i = 0; i < _entities.length; i++) {
      this.entityPositions.set(_entities[i], i)
    }

    /* React to listeners being added to onEnter */
    this.onEnter.onSubscribe.subscribe((listener) => {
      for (const entity of this) {
        listener(entity)
      }
    })
  }

  /**
   * Fired when an entity has been added to the bucket.
   */
  onEntityAdded = new Event<[entity: E]>()

  /**
   * Fired when an entity is about to be removed from the bucket.
   */
  onEntityRemoved = new Event<[entity: E]>()

  /**
   * Fired when an entity enters this bucket. The main difference between this and
   * `onAdd` is that when new listeners are added to this event, they will also
   * be applied to all entities that are already in the bucket.
   */
  onEnter = new Event<[entity: E]>()

  /**
   * A map of entity positions, used for fast lookups.
   */
  private entityPositions = new Map<E, number>()

  /**
   * Returns the total size of the bucket, i.e. the number of entities it contains.
   */
  get size() {
    return this.entities.length
  }

  /**
   * Returns the first entity in the bucket, or `undefined` if the bucket is empty.
   */
  get first(): E | undefined {
    return this.entities[0]
  }

  /**
   * Returns true if the bucket contains the given entity.
   *
   * @param entity The entity to check for.
   * @returns `true` if the specificed entity is in this bucket, `false` otherwise.
   */
  has(entity: any): entity is E {
    return this.entityPositions.has(entity)
  }

  /**
   * Adds the given entity to the bucket. If the entity is already in the bucket, it is
   * not added again.
   *
   * @param entity The entity to add to the bucket.
   * @returns The entity passed into this function (regardless of whether it was added or not).
   */
  add<D extends E>(entity: D): D & E {
    if (entity && !this.has(entity)) {
      this.entities.push(entity)
      this.entityPositions.set(entity, this.entities.length - 1)

      /* Emit relevant events */
      this.onEntityAdded.emit(entity)
      this.onEnter.emit(entity)
    }

    return entity
  }

  /**
   * Removes the given entity from the bucket. If the entity is not in the bucket, nothing
   * happens.
   *
   * @param entity The entity to remove from the bucket.
   * @returns The entity passed into this function (regardless of whether it was removed or not).
   */
  remove(entity: E) {
    /* TODO: Return early if entity is not in bucket. */
    if (this.has(entity)) {
      /* Emit our own onEntityRemoved event. */
      this.onEntityRemoved.emit(entity)

      /* Get the entity's current position. */
      const index = this.entityPositions.get(entity)!
      this.entityPositions.delete(entity)

      /* Perform shuffle-pop if there is more than one entity. */
      const other = this.entities[this.entities.length - 1]
      if (other !== entity) {
        this.entities[index] = other
        this.entityPositions.set(other, index)
      }

      /* Remove the entity from the entities array. */
      this.entities.pop()
    }

    return entity
  }

  /**
   * Removes all entities from the bucket. Will cause the `onEntityRemoved` event to be
   * fired for each entity.
   */
  clear() {
    for (const entity of this) {
      this.remove(entity)
    }
  }
}
