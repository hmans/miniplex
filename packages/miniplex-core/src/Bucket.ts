import { Event } from "@hmans/event"

export type BucketOptions<E> = {
  entities?: E[]
  predicate?: (entity: E) => entity is E
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

  entities: E[]
  predicate: (entity: E) => entity is E
  protected derivedBuckets = new Map<Function, Bucket<any>>()

  onEntityAdded = new Event<E>()
  onEntityRemoved = new Event<E>()

  constructor({
    entities = [],
    predicate = (entity): entity is E => true
  }: BucketOptions<E> = {}) {
    this.entities = entities
    this.predicate = predicate
  }

  get size() {
    return this.entities.length
  }

  has(entity: E) {
    return this.entities.includes(entity)
  }

  add<D extends E>(entity: D): E & D {
    if (entity && !this.has(entity) && this.predicate(entity)) {
      /* Add to list of entities */
      this.entities.push(entity)
      this.onEntityAdded.emit(entity)

      /* Add to derived buckets */
      for (const bucket of this.derivedBuckets.values()) {
        bucket.add(entity)
      }
    }

    return entity
  }

  remove(entity: E) {
    if (!entity) return entity

    const index = this.entities.indexOf(entity)

    if (index !== -1) {
      /* Remove from list of entities */
      this.entities.splice(index, 1)
      this.onEntityRemoved.emit(entity)

      /* Remove from derived buckets */
      for (const bucket of this.derivedBuckets.values()) {
        bucket.remove(entity)
      }
    }

    return entity
  }

  derive<D extends E>(
    predicate: ((entity: E) => entity is D) | ((entity: E) => boolean)
  ) {
    if (!this.derivedBuckets.has(predicate)) {
      /* Create and store new bucket */
      const bucket = new Bucket({
        predicate: predicate as (entity: E) => entity is D
      })

      this.derivedBuckets.set(predicate, bucket)

      /* Add existing entities to new bucket */
      for (const entity of this.entities) {
        bucket.add(entity as D)
      }
    }

    return this.derivedBuckets.get(predicate)! as Bucket<D>
  }
}
