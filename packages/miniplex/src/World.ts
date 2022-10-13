import { IEntity } from "./types"
import { Event } from "@hmans/event"

export class World<E extends IEntity> {
  [Symbol.iterator]() {
    return this.entities[Symbol.iterator]()
  }

  entities: E[]
  onEntityAdded = new Event<E>()
  onEntityRemoved = new Event<E>()
  onEntityUpdated = new Event<E>()

  constructor(options: { entities?: E[] } = {}) {
    this.entities = options.entities || []
  }

  add(entity: E) {
    if (this.entities.includes(entity)) return

    this.entities.push(entity)
    this.onEntityAdded.emit(entity)
  }

  remove(entity: E) {
    const index = this.entities.indexOf(entity)
    if (index === -1) return

    this.onEntityRemoved.emit(entity)
    this.entities[index] = this.entities[this.entities.length - 1]
    this.entities.pop()
  }

  touch(entity: E) {
    if (!this.entities.includes(entity)) return

    this.onEntityUpdated.emit(entity)
  }
}
