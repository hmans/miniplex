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

  entities: E[] = []

  onEntityAdded = new Event<E>()
  onEntityRemoved = new Event<E>()

  get size() {
    return this.entities.length
  }

  has(entity: any): entity is E {
    return this.entities.includes(entity)
  }

  add<D extends E>(entity: D): D & E {
    if (entity && !this.has(entity)) {
      this.entities.push(entity)
      this.onEntityAdded.emit(entity)
    }

    return entity
  }

  remove(entity: E) {
    if (this.has(entity)) {
      const index = this.entities.indexOf(entity)
      this.entities.splice(index, 1)
      this.onEntityRemoved.emit(entity)
    }

    return entity
  }
}
