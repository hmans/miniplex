import { Event } from "@hmans/event"

/**
 * A class wrapping an array of entities of a specific type, providing
 * performance-optimized methods for adding and removing entities, and events
 * for when entities are added or removed.
 */
export class Bucket<E> implements Iterable<E> {
  /* Custom iterator that iterates over all entities in reverse order. */
  [Symbol.iterator]() {
    let index = this.entities.length

    return {
      next: () => {
        const value = this.entities[--index]
        return { value, done: index < 0 }
      }
    }
  }

  constructor(public entities: E[] = []) {
    this.add = this.add.bind(this)
    this.remove = this.remove.bind(this)

    /* Register all entity positions */
    for (let i = 0; i < entities.length; i++) {
      this.entityPositions.set(entities[i], i)
    }
  }

  /**
   * Fired when an entity has been added to the bucket.
   */
  onEntityAdded = new Event<E>()

  /**
   * Fired when an entity is about to be removed from the bucket.
   */
  onEntityRemoved = new Event<E>()

  private entityPositions = new Map<E, number>()

  get size() {
    return this.entities.length
  }

  has(entity: any): entity is E {
    return this.entityPositions.has(entity)
  }

  add<D extends E>(entity: D): D & E {
    if (entity && !this.has(entity)) {
      this.entities.push(entity)
      this.entityPositions.set(entity, this.entities.length - 1)

      /* Emit our own onEntityAdded event */
      this.onEntityAdded.emit(entity)
    }

    return entity
  }

  remove(entity: E) {
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

  clear() {
    for (const entity of this) {
      this.remove(entity)
    }
  }
}
