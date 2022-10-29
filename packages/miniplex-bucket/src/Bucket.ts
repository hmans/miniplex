import { Event } from "@hmans/event"

export type Predicate<E, D extends E> =
  | ((v: E) => v is D)
  | ((entity: E) => boolean)

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

  constructor(public entities: E[] = []) {}

  onEntityAdded = new Event<E>()
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
      const index = this.entityPositions.get(entity)!

      const other = this.entities[this.entities.length - 1]
      if (other !== entity) {
        this.entities[index] = other
        this.entityPositions.set(other, index)
      }

      this.entities.pop()
      this.entityPositions.delete(entity)

      /* Remove the entity from any derived buckets. */
      for (const query of this.derivedBuckets.values()) {
        query.remove(entity)
      }

      /* Emit our own onEntityRemoved event. */
      this.onEntityRemoved.emit(entity)
    }

    return entity
  }

  clear() {
    for (const entity of this) {
      this.remove(entity)
    }
  }

  derivedBuckets = new Map<Predicate<E, any>, Bucket<any>>()

  where<D extends E>(predicate: Predicate<E, D>): Bucket<D> {
    if (this.derivedBuckets.has(predicate)) {
      return this.derivedBuckets.get(predicate)!
    }

    const bucket = new Bucket<D>()
    this.derivedBuckets.set(predicate, bucket)

    for (const entity of this.entities) {
      if (predicate(entity)) {
        bucket.add(entity)
      }
    }

    return bucket
  }
}
