import { IEntity } from "./types"
import { Event } from "@hmans/event"

export type BucketOptions<E extends IEntity> = {
  entities?: E[]
}

export class Bucket<E extends IEntity> {
  entities: E[]

  onEntityAdded = new Event<E>()
  onEntityRemoved = new Event<E>()

  constructor(opts: BucketOptions<E> = {}) {
    this.entities = opts.entities || []
  }

  add(entity: E) {
    if (!this.has(entity)) {
      this.entities.push(entity)
      this.onEntityAdded.emit(entity)
    }

    return entity
  }

  remove(entity: E) {
    const index = this.entities.indexOf(entity)

    if (index !== -1) {
      this.entities[index] = this.entities[this.entities.length - 1]
      this.entities.pop()

      this.onEntityRemoved.emit(entity)
    }

    return entity
  }

  has(entity: E) {
    return this.entities.includes(entity)
  }
}
