import { Event } from "@hmans/event"

export type Predicate<E, D extends E> =
  | ((v: E) => v is D)
  | ((entity: E) => boolean)

export class Bucket<E> {
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

  constructor(public entities: E[] = []) {}

  /**
   * Fired when an entity has been added to the bucket.
   */
  onEntityAdded = new Event<E>()

  /**
   * Fired when an entity is about to be removed from the bucket.
   */
  onEntityRemoved = new Event<E>()

  private entityPositions = new Map<E, number>()

  derivedBuckets = new Map<Predicate<E, any>, Bucket<any>>()

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

      /* Add the entity to any derived buckets. */
      for (const [predicate, bucket] of this.derivedBuckets) {
        if (predicate(entity)) {
          bucket.add(entity)
        }
      }
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

      /* Remove the entity from any derived buckets. */
      for (const query of this.derivedBuckets.values()) {
        query.remove(entity)
      }
    }

    return entity
  }

  clear() {
    for (const entity of this) {
      this.remove(entity)
    }
  }

  where<D extends E>(predicate: Predicate<E, D>): Bucket<D> {
    /* If we already have a bucket for the given predicate, return it. */
    if (this.derivedBuckets.has(predicate)) {
      return this.derivedBuckets.get(predicate)!
    }

    /* Otherwise, create a new bucket. */
    const bucket = new Bucket<D>()
    this.derivedBuckets.set(predicate, bucket)

    /* Add all entities that match the predicate to the new bucket. */
    for (const entity of this.entities) {
      if (predicate(entity)) {
        bucket.add(entity)
      }
    }

    return bucket
  }
}
