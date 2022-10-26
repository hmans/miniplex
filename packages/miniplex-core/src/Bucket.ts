import { IEntity } from "./types"
import { Event } from "@hmans/event"

export type BucketOptions<E extends IEntity> = {
  entities?: E[]
}

export class Bucket<E extends IEntity> {
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

  private entityPositions = new Map<E, number>()

  onEntityAdded = new Event<E>()
  onEntityRemoved = new Event<E>()

  constructor(opts: BucketOptions<E> = {}) {
    this.entities = opts.entities || []
  }

  get size() {
    return this.entities.length
  }

  add(entity: E) {
    if (!this.has(entity)) {
      const position = this.entities.push(entity)
      this.entityPositions.set(entity, position - 1)
      this.onEntityAdded.emit(entity)
    }

    return entity
  }

  remove(entity: E) {
    const index = this.entityPositions.get(entity)

    if (index !== undefined) {
      /* shuffle-pop */
      const last = this.entities[this.entities.length - 1]
      this.entities[index] = last
      this.entities.pop()

      /* Update entity positions */
      this.entityPositions.set(last, index)
      this.entityPositions.delete(entity)

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

  has(entity: E) {
    return this.entityPositions.has(entity)
  }
}
