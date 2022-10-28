import { Bucket } from "@miniplex/bucket"
import { Query } from "./Query"
import { IEntity, PredicateFunction } from "./types"

export class World<E extends IEntity> extends Bucket<E> {
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

  queries = new Map<PredicateFunction<E, any>, Query<E, any>>()

  query<D extends E>(fun: PredicateFunction<E, D>): Query<E, D> {
    if (this.queries.has(fun)) {
      return this.queries.get(fun)!
    }

    const predicate = new Query(fun)
    this.queries.set(fun, predicate)

    for (const entity of this) {
      if (fun(entity)) {
        predicate.add(entity)
      }
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
