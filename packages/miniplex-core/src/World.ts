import { Bucket } from "@miniplex/bucket"
import { Predicate } from "./Predicate"
import { IEntity, PredicateFunction } from "./types"

export class World<E extends IEntity> extends Bucket<E> {
  queries = new Map<PredicateFunction<E, any>, Predicate<any, E>>()

  constructor() {
    super()

    this.onEntityAdded.add((entity) => {
      for (const query of this.queries.values()) {
        if (query.predicate(entity)) {
          query.add(entity)
        }
      }
    })

    this.onEntityRemoved.add((entity) => {
      for (const query of this.queries.values()) {
        query.remove(entity)
      }
    })
  }

  registerQuery(query: Predicate<any, E>) {
    this.queries.set(query.predicate, query)
  }

  unregisterQuery(query: Predicate<any, E>) {
    this.queries.delete(query.predicate)
  }

  predicate<D extends E>(fun: PredicateFunction<E, D>): Predicate<D, E> {
    let predicate = this.queries.get(fun)

    if (!predicate) {
      predicate = new Predicate(this, fun)
      this.registerQuery(predicate)
    }

    return predicate
  }

  addComponent<C extends keyof E>(entity: E, component: C, value: E[C]) {
    /* Return early if the entity already has the component. */
    if (entity[component] !== undefined) return

    /* Set the component */
    entity[component] = value

    /* Update queries */
    for (const query of this.queries.values()) {
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

      for (const query of this.queries.values()) {
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
