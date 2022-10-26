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

  constructor({ entities = [] }: BucketOptions<E> = {}) {
    this.entities = entities

    /* Fill entity positions */
    for (let i = 0; i < entities.length; i++) {
      this.entityPositions.set(entities[i], i)
    }
  }

  get size() {
    return this.entities.length
  }

  add<D extends E>(entity: D): E & D {
    if (!this.has(entity)) {
      this.entities.push(entity)
      this.entityPositions.set(entity, this.entities.length - 1)
      this.onEntityAdded.emit(entity)
    }

    return entity
  }

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

  has(entity: E) {
    return this.entityPositions.has(entity)
  }
}
