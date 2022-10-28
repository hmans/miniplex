import { Event } from "@hmans/event"

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
      this.onEntityAdded.emit(entity)
    }

    return entity
  }

  remove(entity: E) {
    if (this.has(entity)) {
      const index = this.entityPositions.get(entity)!
      this.entities.splice(index, 1)
      this.entityPositions.delete(entity)
      this.onEntityRemoved.emit(entity)
    }

    return entity
  }

  clear() {
    for (const entity of this) {
      this.remove(entity)
    }
  }
}
