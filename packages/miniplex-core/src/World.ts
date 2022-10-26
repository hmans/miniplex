import { Archetype } from "./Archetype"
import { Bucket } from "./Bucket"
import { entityMatches } from "./queries"
import { IEntity, Query } from "./types"

export type WorldOptions<E extends IEntity> = {
  entities?: E[]
}

export class World<E extends IEntity> extends Bucket<E> {
  private archetypes = new Map<Query<E>, Archetype<E>>()

  add(entity: E) {
    super.add(entity)

    return entity
  }

  remove(entity: E) {
    super.remove(entity)

    return entity
  }

  addComponent<C extends keyof E>(entity: E, component: C, value: E[C]) {
    entity[component] = value
  }

  removeComponent<C extends keyof E>(entity: E, component: C) {
    delete entity[component]
  }

  archetype(query: Query<E>): Archetype<E> {
    // TODO: normalize query

    /* Create archetype and remember it for later */
    const archetype = new Archetype<E>()
    this.archetypes.set(query, archetype)

    /* Check existing entities for matches */
    for (const entity of this.entities) {
      if (entityMatches(entity, query)) {
        archetype.add(entity)
      }
    }

    /* We're done, return the archetype */
    return archetype
  }
}
