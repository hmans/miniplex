import { Event } from "@hmans/event"

export interface IEntity {
  [key: string]: any
}

export type EntityWith<E, P extends keyof E> = E & { [K in P]-?: E[K] }

export type EntityPredicate<E, D extends E> = (entity: E) => entity is D

export class Bucket<E extends IEntity> {
  [Symbol.iterator]() {
    return this.entities[Symbol.iterator]()
  }

  entities = new Array<E>()

  onEntityAdded = new Event<E>()
  onEntityRemoved = new Event<E>()
  onEntityTouched = new Event<E>()

  derivedBuckets = new WeakMap()

  has(entity: E) {
    return this.entities.includes(entity)
  }

  add(entity: E) {
    const index = this.entities.indexOf(entity)

    /* Add the entity if we don't already have it */
    if (index === -1) {
      this.entities.push(entity)
      this.onEntityAdded.emit(entity)
    }

    return entity
  }

  touch(entity: E) {
    const index = this.entities.indexOf(entity)

    if (index !== -1) {
      /* Emit an event if the entity changed */
      this.onEntityTouched.emit(entity)
    }

    return entity
  }

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

  clear() {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      this.remove(this.entities[i])
    }
  }

  derive<D extends E = E>(
    predicate: ((entity: E) => entity is D) | ((entity: E) => boolean) = () =>
      true
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
