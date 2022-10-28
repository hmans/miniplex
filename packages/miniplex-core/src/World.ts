import { DerivableBucket } from "@miniplex/bucket/src"
import { IEntity } from "./types"

export class World<E extends IEntity> extends DerivableBucket<E> {
  constructor() {
    super()

    this.onEntityAdded.add((entity) => {
      for (const [predicate, bucket] of this.derivedBuckets) {
        if (predicate(entity)) {
          bucket.add(entity)
        }
      }
    })

    this.onEntityRemoved.add((entity) => {
      for (const query of this.derivedBuckets.values()) {
        query.remove(entity)
      }
    })
  }

  addComponent<C extends keyof E>(entity: E, component: C, value: E[C]) {
    /* Return early if the entity already has the component. */
    if (entity[component] !== undefined) return

    /* Set the component */
    entity[component] = value

    /* Update archetypes */
    for (const [predicate, bucket] of this.derivedBuckets) {
      if (predicate(entity)) {
        bucket.add(entity)
      }
    }

    /* If this world doesn't know about the entity, we're done. */
    if (!this.has(entity)) return
  }

  removeComponent(entity: E, component: keyof E) {
    /* Return early if the entity doesn't have the component. */
    if (entity[component] === undefined) return

    /* Update archetypes */
    if (this.has(entity)) {
      const future = { ...entity }
      delete future[component]

      for (const [predicate, bucket] of this.derivedBuckets) {
        if (predicate(future)) {
          bucket.add(entity)
        } else {
          bucket.remove(entity)
        }
      }
    }

    /* Remove the component */
    delete entity[component]
  }
}
