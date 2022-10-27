import { Event } from "@hmans/event"

export type BucketOptions<E> = {
  entities?: E[]
}

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

  /**
   * All entities stored in this bucket.
   */
  entities: E[]

  /**
   * A map of entities to their positions within the `entities` array.
   * Used internally for performance optimizations.
   */
  private entityPositions = new Map<E, number>()

  /**
   * An event that is emitted when an entity is added to this bucket.
   */
  onEntityAdded = new Event<E>()

  /**
   * An event that is emitted when an entity is removed from this bucket.
   */
  onEntityRemoved = new Event<E>()

  constructor({ entities = [] }: BucketOptions<E> = {}) {
    this.entities = entities

    /* Fill entity positions */
    for (let i = 0; i < entities.length; i++) {
      this.entityPositions.set(entities[i], i)
    }
  }

  /**
   * Returns the size of this bucket (equal to the number of entities stored
   * within it.)
   */
  get size() {
    return this.entities.length
  }

  /**
   * Adds an entity to this bucket.
   *
   * @param entity The entity to add to this bucket.
   * @returns The entity that was added.
   */
  add<D extends E>(entity: D): E & D {
    if (entity !== undefined && !this.has(entity)) {
      this.entities.push(entity)
      this.entityPositions.set(entity, this.entities.length - 1)
      this.onEntityAdded.emit(entity)
    }

    return entity
  }

  /**
   * Removes an entity from this bucket.
   *
   * @param entity The entity to remove from this bucket.
   * @returns The entity.
   */
  remove(entity: E) {
    const index = this.entityPositions.get(entity)

    if (index !== undefined) {
      /* Remove entity from our list */
      this.entityPositions.delete(entity)

      const other = this.entities[this.entities.length - 1]

      if (other !== entity) {
        this.entities[index] = other
        this.entityPositions.set(other, index)
      }

      this.entities.pop()

      this.onEntityRemoved.emit(entity)
    }

    return entity
  }

  clear() {
    for (const entity of this) {
      this.remove(entity)
    }

    this.entityPositions.clear()
  }

  /**
   * Returns `true` if the given entity is stored within this bucket.
   *
   * @param entity The entity to check for.
   * @returns `true` if the given entity is stored within this bucket.
   */
  has(entity: E) {
    return this.entityPositions.has(entity)
  }
}
