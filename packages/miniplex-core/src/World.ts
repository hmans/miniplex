import { Bucket } from "./Bucket"
import { IEntity } from "./types"

export type WorldOptions<E extends IEntity> = {
  entities?: E[]
}

export class World<E extends IEntity> extends Bucket<E> {
  constructor(opts: WorldOptions<E> = {}) {
    super(opts)
  }

  addComponent<C extends keyof E>(entity: E, component: C, value: E[C]) {
    if (!entity) return

    entity[component] = value

    if (this.has(entity)) {
      /* Update derived buckets */
      for (const bucket of this.derivedBuckets.values()) {
        if (bucket.predicate(entity)) {
          bucket.add(entity)
        } else {
          bucket.remove(entity)
        }
      }
    }
  }

  removeComponent<C extends keyof E>(entity: E, component: C) {
    if (!entity) return

    if (this.has(entity)) {
      /* Update derived buckets */
      const copy = { ...entity }
      delete copy[component]

      for (const bucket of this.derivedBuckets.values()) {
        if (bucket.predicate(copy)) {
          bucket.add(entity)
        } else {
          bucket.remove(entity)
        }
      }
    }

    delete entity[component]
  }
}
