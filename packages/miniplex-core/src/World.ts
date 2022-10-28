import { Bucket } from "@miniplex/bucket"
import { Query } from "./Query"
import { IEntity } from "./types"

export class World<E extends IEntity> extends Bucket<E> {
  queries = new Bucket<Query<any, E>>()

  registerQuery(query: Query<any, E>) {
    this.queries.add(query)
  }

  unregisterQuery(query: Query<any, E>) {
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
      const copy = { ...entity }
      delete copy[component]

      for (const query of this.queries) {
        if (query.predicate(copy)) {
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
