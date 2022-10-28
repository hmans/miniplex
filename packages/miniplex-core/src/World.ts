import { Bucket } from "@miniplex/bucket"
import { Predicate } from "./Predicate"
import { IEntity } from "./types"

export class World<E extends IEntity> extends Bucket<E> {
  queries = new Bucket<Predicate<any, E>>()

  constructor() {
    super()

    this.onEntityAdded.add((entity) => {
      for (const query of this.queries) {
        if (query.predicate(entity)) {
          query.add(entity)
        }
      }
    })

    this.onEntityRemoved.add((entity) => {
      for (const query of this.queries) {
        query.remove(entity)
      }
    })
  }

  registerQuery(query: Predicate<any, E>) {
    this.queries.add(query)
  }

  unregisterQuery(query: Predicate<any, E>) {
    this.queries.remove(query)
  }

  addComponent<C extends keyof E>(entity: E, component: C, value: E[C]) {
    /* Return early if the entity already has the component. */
    if (entity[component] !== undefined) return

    /* Set the component */
    entity[component] = value

    /* Update queries */
    for (const query of this.queries) {
      if (query.predicate(entity)) {
        query.add(entity)
      }
    }

    /* If this world doesn't know about the entity, we're done. */
    if (!this.has(entity)) return
  }

  removeComponent(entity: E, component: keyof E) {
    /* Return early if the entity doesn't have the component. */
    if (entity[component] === undefined) return

    /* Update queries */
    if (this.has(entity)) {
      const future = { ...entity }
      delete future[component]

      for (const query of this.queries) {
        if (query.predicate(future)) {
          query.add(entity)
        } else {
          query.remove(entity)
        }
      }
    }

    /* Remove the component */
    delete entity[component]
  }
}
