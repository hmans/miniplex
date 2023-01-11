import { Bucket } from "@miniplex/bucket"
import { Query } from "./Query"

export class World<E extends {} = any> extends Bucket<E> {
  queries: Query<any>[] = []

  constructor(entities: E[] = []) {
    super(entities)

    /* When entities are added, reindex them immediately */
    this.onEntityAdded.add((entity) => {
      this.reindex(entity)
    })

    /* When entities are removed, also make sure to forget about their IDs. */
    this.onEntityRemoved.add((entity) => {
      /* Remove the entity from the ID map */
      if (this.entityToId.has(entity)) {
        const id = this.entityToId.get(entity)!
        this.idToEntity.delete(id)
        this.entityToId.delete(entity)
      }
    })
  }

  query<D extends E>(input: Query<D> | ((query: Query<E>) => Query<D>)) {
    // TODO: memoize queries

    const query = input instanceof Query ? input : input(new Query<E>())
    this.queries.push(query)

    /* Reindex all entities to see if they match the query. */
    for (const entity of this.entities) {
      query.evaluate(entity)
    }

    return query
  }

  addComponent<C extends keyof E>(entity: E, component: C, value: E[C]) {
    /* Return early if the entity already has the component. */
    if (entity[component] !== undefined) return

    /* Set the component */
    entity[component] = value

    /* Touch the entity, triggering re-checks of indices */
    if (this.has(entity)) {
      this.reindex(entity)
    }
  }

  removeComponent(entity: E, component: keyof E) {
    /* Return early if the entity doesn't even have the component. */
    if (entity[component] === undefined) return

    /* If this world knows about the entity, notify any derived buckets about the change. */
    if (this.has(entity)) {
      const future = { ...entity }
      delete future[component]
      this.reindex(entity, future)
    }

    /* Remove the component. */
    delete entity[component]
  }

  protected reindex(entity: E, future = entity) {
    for (const query of this.queries) {
      query.evaluate(entity, future)
    }
  }

  /* IDs */
  private entityToId = new Map<E, number>()
  private idToEntity = new Map<number, E>()
  private nextId = 0

  id(entity: E) {
    /* We only ever want to generate IDs for entities that are actually in the world. */
    if (!this.has(entity)) return undefined

    /* Lazily generate an ID. */
    if (!this.entityToId.has(entity)) {
      const id = this.nextId++
      this.entityToId.set(entity, id)
      this.idToEntity.set(id, entity)
    }

    return this.entityToId.get(entity)!
  }

  entity(id: number) {
    return this.idToEntity.get(id)
  }
}
