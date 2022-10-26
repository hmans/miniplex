import { Bucket } from "./Bucket"
import { IEntity, Query } from "./types"

export type WorldOptions<E extends IEntity> = {
  entities?: E[]
}

export class World<E extends IEntity> extends Bucket<E> {
  addComponent<C extends keyof E>(entity: E, component: C, value: E[C]) {
    entity[component] = value
  }

  removeComponent<C extends keyof E>(entity: E, component: C) {
    delete entity[component]
  }

  archetype(query: Query<E>) {}
}
