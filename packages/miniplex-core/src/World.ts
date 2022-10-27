import { Archetype } from "./Archetype"
import { Bucket, BucketOptions } from "./Bucket"
import { normalizeQuery, serializeQuery } from "./queries"
import { IEntity, Query, WithComponents } from "./types"

export type WorldOptions<E extends IEntity> = BucketOptions<E>

export class World<E extends IEntity> extends Bucket<E> {
  /* Archetypes */
  private archetypes = new Map<string, Archetype<any>>()

  /* Entity IDs */
  private nextID = 0
  private entityToID = new Map<E, number>()
  private idToEntity = new Map<number, E>()

  constructor(options: WorldOptions<E> = {}) {
    super(options)

    this.onEntityAdded.add((entity) => {
      /* Add entity to matching archetypes */
      for (const archetype of this.archetypes.values()) {
        if (archetype.matchesEntity(entity)) {
          archetype.add(entity)
        }
      }
    })

    this.onEntityRemoved.add((entity) => {
      /* Remove entity from all archetypes */
      for (const archetype of this.archetypes.values()) {
        archetype.remove(entity)
      }

      /* Remove IDs */
      const id = this.entityToID.get(entity)!
      this.idToEntity.delete(id)
      this.entityToID.delete(entity)
    })
  }

  id(entity: E) {
    if (!this.has(entity)) return

    if (!this.entityToID.has(entity)) {
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
    /* Don't overwrite existing components */
    if (entity[component] !== undefined) return

    entity[component] = value

    /* Re-check known archetypes */
    if (this.has(entity))
      for (const archetype of this.archetypes.values())
        archetype.matchesEntity(entity)
          ? archetype.add(entity)
          : archetype.remove(entity)
  }

  removeComponent<C extends keyof E>(entity: E, component: C) {
    /* Return early if component doesn't exist on entity */
    if (entity[component] === undefined) return

    /* Re-check known archetypes */
    if (this.has(entity)) {
      const copy = { ...entity }
      delete copy[component]

      for (const archetype of this.archetypes.values())
        archetype.matchesEntity(copy)
          ? archetype.add(entity)
          : archetype.remove(entity)
    }

    /* At this point, all relevant callbacks will have executed. Now it's
    safe to remove the component. */

    delete entity[component]
  }

  /**
   * Returns an archetype bucket holding all entities that have all of the specified
   * components.
   *
   * @param components One or multiple components to query for
   */
  archetype<C extends keyof E>(
    ...components: C[]
  ): Archetype<WithComponents<E, C>>

  /**
   * Returns an archetype bucket holding all entities that match the specified
   * query. The query is a simple object with optional `all`, `any` and `none`
   * keys. Each key should be an array of component names.
   *
   * The `all` key specifies that all of the components in the array must be present.
   * The `any` key specifies that at least one of the components in the array must be present.
   * The `none` key specifies that none of the components in the array must be present.
   *
   * @param query
   */
  archetype<C extends keyof E>(query: {
    all?: C[]
    any?: (keyof E)[]
    none?: (keyof E)[]
  }): Archetype<WithComponents<E, C>>

  archetype<C extends keyof E>(
    query: Query<E, C> | C,
    ...extra: C[]
  ): Archetype<WithComponents<E, C>> {
    /* If the query is not a query object, turn it into one and call
    ourselves. Yay overloading in TypeScript! */
    if (typeof query !== "object") {
      return this.archetype({ all: [query, ...extra] })
    }

    /* Build a normalized query object and key */
    const normalizedQuery = normalizeQuery(query)
    const key = serializeQuery(normalizedQuery)

    /* If we haven't seen this query before, create a new archetype */
    if (!this.archetypes.has(key)) {
      const archetype = new Archetype(normalizedQuery)
      this.archetypes.set(key, archetype)

      /* Check existing entities for matches */
      for (const entity of this.entities) {
        if (archetype.matchesEntity(entity)) {
          archetype.add(entity)
        }
      }
    }

    /* We're done, return the archetype! */
    return this.archetypes.get(key)! as Archetype<WithComponents<E, C>>
  }
}
