import { Bucket } from "./Bucket"
import { IEntity, Query } from "./types"

export type WorldOptions<E extends IEntity> = {
  entities?: E[]
}

export class World<E extends IEntity> extends Bucket<E> {
  add(entity: E) {
    this.entities.push(entity)
  }

  remove(entity: E) {
    const index = this.entities.indexOf(entity)

    if (index !== -1) {
      this.entities[index] = this.entities[this.entities.length - 1]
      this.entities.pop()
    }
  }

  addComponent<C extends keyof E>(entity: E, component: C, value: E[C]) {
    entity[component] = value
  }

  removeComponent<C extends keyof E>(entity: E, component: C) {
    delete entity[component]
  }

  archetype(query: Query<E>) {}
}
