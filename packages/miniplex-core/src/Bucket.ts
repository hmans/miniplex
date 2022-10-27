export type BucketOptions<E> = {
  entities?: E[]
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

  constructor({ entities = [] }: BucketOptions<E> = {}) {
    this.#entities = entities
  }

  get size() {
    return this.#entities.length
  }

  has(entity: E) {
    return this.#entities.includes(entity)
  }

  add(entity: E) {
    if (entity && !this.has(entity)) {
      this.#entities.push(entity)
    }

    return entity
  }

  remove(entity: E) {
    if (!entity) return entity

    const index = this.#entities.indexOf(entity)

    if (index !== -1) {
      this.#entities.splice(index, 1)
    }

    return entity
  }
}
