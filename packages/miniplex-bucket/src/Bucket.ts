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

  entities: E[] = []

  constructor(
    public source: Bucket<any> | E[] = [],
    public predicate: Predicate<any, E> = () => true
  ) {
    this.add = this.add.bind(this)
    this.remove = this.remove.bind(this)

    /* If we have a source bucket, add ourselves as a listener. */
    if (source instanceof Bucket) {
      source.onEntityAdded.add(this.add)
      source.onEntityRemoved.add(this.remove)
    }

    /* Add all entities contained in the source */
    for (const entity of source instanceof Bucket ? source.entities : source) {
      this.add(entity)
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

  derivedBuckets = new Map<Predicate<E, any>, Bucket<any>>()

  get size() {
    return this.entities.length
  }

  has(entity: any): entity is E {
    return this.entityPositions.has(entity)
  }

  add<D extends E>(entity: D): D & E {
    if (entity && !this.has(entity) && this.predicate(entity)) {
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

  /* TODO: is `test` really the best name? */
  test(entity: E, future = entity) {
    const has = this.has(entity)
    const wants = this.predicate(future)

    if (has && !wants) {
      this.remove(entity)
    } else if (!has && wants) {
      this.add(entity)
    } else if (has && wants) {
      for (const bucket of this.derivedBuckets.values()) {
        bucket.test(entity, future)
      }
    }
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
    const bucket = new Bucket(this, predicate)
    this.derivedBuckets.set(predicate, bucket)

    return bucket
  }
}
