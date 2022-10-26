import { Archetype } from "./Archetype"
import { Bucket } from "./Bucket"
import { normalizeQuery, serializeQuery } from "./queries"
import { IEntity, Query, WithRequiredComponents } from "./types"

export type WorldOptions<E extends IEntity> = {
  entities?: E[]
}

export class World<E extends IEntity> extends Bucket<E> {
  /* Archetypes */
  private archetypes = new Map<string, Archetype<E>>()

  /* Entity IDs */
  private nextID = 0
  private entityToID = new Map<E, number>()
  private idToEntity = new Map<number, E>()

  add<D extends E>(entity: D): E & D {
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

    /* Remove IDs */
    const id = this.entityToID.get(entity)!
    this.idToEntity.delete(id)
    this.entityToID.delete(entity)

    return super.remove(entity)
  }

  id(entity: E) {
    if (!this.entityToID.has(entity) && this.has(entity)) {
      const id = this.nextID++
      this.entityToID.set(entity, id)
      this.idToEntity.set(id, entity)

      return id
    }

    return this.entityToID.get(entity)
  }

  entity(id: number) {
    return this.idToEntity.get(id)
  }

  addComponent<C extends keyof E>(entity: E, component: C, value: E[C]) {
    entity[component] = value

    /* Re-check known archetypes */
    if (this.has(entity))
      for (const archetype of this.archetypes.values())
        archetype.matchesEntity(entity)
          ? archetype.add(entity)
          : archetype.remove(entity)
  }

  removeComponent<C extends keyof E>(entity: E, component: C) {
    /* Re-check known archetypes */
    if (this.has(entity)) {
      const components = Object.keys(entity).filter((c) => c !== component)

      for (const archetype of this.archetypes.values())
        archetype.matchesComponents(components)
          ? archetype.add(entity)
          : archetype.remove(entity)
    }

    /* At this point, all relevant callbacks will have executed. Now it's
    safe to remove the component. */

    delete entity[component]
  }

  archetype<D extends E, C extends keyof E>(
    ...components: C[]
  ): Archetype<WithRequiredComponents<E, C>>

  archetype<D extends E = E>(query: Query<E>): Archetype<D>

  archetype<D extends E = E>(
    query: Query<E> | keyof E,
    ...rest: (keyof E)[]
  ): Archetype<D> {
    if (typeof query !== "object") {
      return this.archetype({ all: [query, ...rest] })
    }

    const normalizedQuery = normalizeQuery(query)
    const key = serializeQuery(normalizedQuery)

    if (this.archetypes.has(key)) {
      return this.archetypes.get(key)! as unknown as Archetype<D>
    }

    /* Create archetype and remember it for later */
    const archetype = new Archetype(normalizedQuery)
    this.archetypes.set(key, archetype)

    /* Check existing entities for matches */
    for (const entity of this.entities) {
      if (archetype.matchesEntity(entity)) {
        archetype.add(entity)
      }
    }

    /* We're done, return the archetype */
    return archetype as unknown as Archetype<D>
  }
}
