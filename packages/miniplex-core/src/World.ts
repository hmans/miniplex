import { Archetype } from "./Archetype"
import { Bucket } from "./Bucket"
import { serializeQuery } from "./queries"
import { IEntity, Query } from "./types"

export type WorldOptions<E extends IEntity> = {
  entities?: E[]
}

export class World<E extends IEntity> extends Bucket<E> {
  private archetypes = new Map<string, Archetype<E>>()

  add(entity: E) {
    super.add(entity)

    /* Add entity to matching archetypes */
    for (const archetype of this.archetypes.values()) {
      if (archetype.matchesEntity(entity)) {
        archetype.add(entity)
      }
    }

    return entity
  }

  remove(entity: E) {
    /* Remove entity from all archetypes */
    for (const archetype of this.archetypes.values()) {
      archetype.remove(entity)
    }

    return super.remove(entity)
  }

  addComponent<C extends keyof E>(entity: E, component: C, value: E[C]) {
    entity[component] = value

    /* Re-check known archetypes */
    for (const archetype of this.archetypes.values()) {
      if (archetype.matchesEntity(entity)) {
        archetype.add(entity)
      } else {
        archetype.remove(entity)
      }
    }
  }

  removeComponent<C extends keyof E>(entity: E, component: C) {
    const components = Object.keys(entity).filter((c) => c !== component)

    /* Re-check known archetypes */
    for (const archetype of this.archetypes.values())
      archetype.matchesComponents(components)
        ? archetype.add(entity)
        : archetype.remove(entity)

    /* At this point, all relevant callbacks will have executed. Now it's
    safe to remove the component. */

    delete entity[component]
  }

  archetype(query: Query<E>): Archetype<E> {
    // TODO: normalize query

    /* Create archetype and remember it for later */
    const archetype = new Archetype(query)
    this.archetypes.set(serializeQuery(query), archetype)

    /* Check existing entities for matches */
    for (const entity of this.entities) {
      if (archetype.matchesEntity(entity)) {
        archetype.add(entity)
      }
    }

    /* We're done, return the archetype */
    return archetype
  }
}
