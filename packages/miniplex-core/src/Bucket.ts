import { Event } from "@hmans/event"

export type BucketOptions<E> = {
  entities?: E[]
  predicate?: (entity: E) => boolean
}

export class Bucket<E> {
  [Symbol.iterator]() {
    let index = this.#entities.length

    return {
      next: () => {
        const value = this.#entities[--index]
        return { value, done: index < 0 }
      }
    }
  }

  #entities: E[]
  #predicate: (entity: E) => boolean
  #derivedBuckets = new Map<Function, Bucket<any>>()

  onEntityAdded = new Event<E>()
  onEntityRemoved = new Event<E>()

  constructor({
    entities = [],
    predicate = () => true
  }: BucketOptions<E> = {}) {
    this.#entities = entities
    this.#predicate = predicate
  }

  get size() {
    return this.#entities.length
  }

  has(entity: E) {
    return this.#entities.includes(entity)
  }

  add(entity: E) {
    if (entity && !this.has(entity) && this.#predicate(entity)) {
      this.#entities.push(entity)
      this.onEntityAdded.emit(entity)
    }

    return entity
  }

  remove(entity: E) {
    if (!entity) return entity

    const index = this.#entities.indexOf(entity)

    if (index !== -1) {
      this.#entities.splice(index, 1)
      this.onEntityRemoved.emit(entity)
    }

    return entity
  }

  derive(predicate: (entity: E) => boolean) {
    // const bucket = new PredicateBucket(predicate)
    // this.onEntityAdded.add((entity) => bucket.add(entity))
    // this.onEntityRemoved.add((entity) => bucket.remove(entity))
    // return bucket
  }
}
