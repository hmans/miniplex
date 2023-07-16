import { Bucket } from "@miniplex/bucket"
import { id } from "@hmans/id"
export * from "@miniplex/bucket"

export type Predicate<E, D extends E> =
  | ((v: E) => v is D)
  | ((entity: E) => boolean)

/**
 * A utility type that marks the specified properties as required.
 */
export type With<E, P extends keyof E> = E & Required<Pick<E, P>>

export type Without<E, P extends keyof E> = Omit<E, P>

/**
 * A utility type that removes all optional properties.
 */
export type Strict<T> = WithoutOptional<T>

/* Utility types */

type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never
}

type WithoutOptional<T> = Pick<T, Exclude<keyof T, OptionalKeys<T>[keyof T]>>

/* Query configuration */

type QueryConfiguration = {
  with: any[]
  without: any[]
  predicates: Function[]
}

interface IQueryableBucket<E> {
  /**
   * Queries for entities that have all of the given components. If this is called on
   * an existing query, the query will be extended to include this new criterion.
   *
   * @param components The components to query for.
   */
  with<C extends keyof E>(...components: C[]): Query<With<E, C>>

  /**
   * Queries for entities that have none of the given components. If this is called on
   * an existing query, the query will be extended to include this new criterion.
   *
   * @param components The components to query for.
   */
  without<C extends keyof E>(...components: C[]): Query<Without<E, C>>

  /**
   * Queries for entities that match the given predicate. If this is called on
   * an existing query, the query will be extended to include this new criterion.
   *
   * @param predicate The predicate to query for.
   */
  where<D extends E>(predicate: Predicate<E, D>): Query<D>
}

export class World<E extends {} = any>
  extends Bucket<E>
  implements IQueryableBucket<E>
{
  constructor(entities: E[] = []) {
    super(entities)

    /* When entities are added, reindex them immediately */
    this.onEntityAdded.subscribe((entity) => {
      this.reindex(entity)
    })

    /* When entities are removed, remove them from all known queries, and delete
    their IDs */
    this.onEntityRemoved.subscribe((entity) => {
      this.queries.forEach((query) => query.remove(entity))

      if (this.entityToId.has(entity)) {
        const id = this.entityToId.get(entity)!
        this.idToEntity.delete(id)
        this.entityToId.delete(entity)
      }
    })
  }

  update(entity: E): E

  update<C extends keyof E>(entity: E, component: C, value: E[C]): E

  update(entity: E, update: Partial<E>): E

  update(entity: E, fun: (entity: E) => Partial<E> | void): E

  update(
    entity: E,
    update?: Partial<E> | keyof E | ((entity: E) => Partial<E> | void),
    value?: any
  ) {
    /* Apply the update */
    if (typeof update === "function") {
      const partial = update(entity)
      partial && Object.assign(entity, partial)
    } else if (typeof update === "string") {
      entity[update] = value
    } else if (update) {
      Object.assign(entity, update)
    }

    /* If this world knows about the entity, reindex it. */
    this.reindex(entity)

    return entity
  }

  /**
   * Adds a component to an entity. If the entity already has the component, the
   * existing component will not be overwritten.
   *
   * After the component was added, the entity will be reindexed, causing it to be
   * added to or removed from any queries depending on their criteria.
   *
   * @param entity The entity to modify.
   * @param component The name of the component to add.
   * @param value The value of the component to add.
   */
  addComponent<C extends keyof E>(entity: E, component: C, value: E[C]) {
    /* Return early if the entity already has the component. */
    if (entity[component] !== undefined) return

    /* Set the component */
    entity[component] = value

    /* Trigger a reindexing */
    this.reindex(entity)
  }

  /**
   * Removes a component from an entity. If the entity does not have the component,
   * this function does nothing.
   *
   * After the component was removed, the entity will be reindexed, causing it to be
   * added to or removed from any queries depending on their criteria.
   *
   * @param entity The entity to modify.
   * @param component The name of the component to remove.
   */
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

  /* QUERIES */

  protected queries = new Set<Query<any>>()

  /**
   * Creates (or reuses) a query that matches the given configuration.
   *
   * @param config The query configuration.
   * @returns A query that matches the given configuration.
   */
  query<D>(config: QueryConfiguration): Query<D> {
    const normalizedConfig = normalizeQueryConfiguration(config)
    const key = configKey(normalizedConfig)

    /* Use existing query if we can find one */
    for (const query of this.queries) {
      if (query.key === key) {
        return query as Query<D>
      }
    }

    /* Otherwise, create new query */
    const query = new Query<D>(this, normalizedConfig)
    this.queries.add(query)
    return query
  }

  /**
   * Creates (or reuses) a query that holds entities that have all of the specified
   * components.
   *
   * @param components One or more component names to query for.
   * @returns A query that holds entities that have all of the given components.
   */
  with<C extends keyof E>(...components: C[]) {
    return this.query<With<E, C>>({
      with: components,
      without: [],
      predicates: []
    })
  }

  /**
   * Creates (or reuses) a query that holds entities that do not have any of the
   * specified components.
   *
   * @param components One or more component names to query for.
   * @returns A query that holds entities that do not have any of the given components.
   */
  without<C extends keyof E>(...components: C[]) {
    return this.query<Without<E, C>>({
      with: [],
      without: components,
      predicates: []
    })
  }

  /**
   * Creates (or reuses) a query that holds entities that match the given predicate.
   * Please note that as soon as you are building queries that use predicates, you
   * will need to explicitly reindex entities when their properties change.
   *
   * @param predicate The predicate that entities must match.
   * @returns A query that holds entities that match the given predicate.
   */
  where<D extends E>(predicate: Predicate<E, D>) {
    return this.query<D>({
      with: [],
      without: [],
      predicates: [predicate]
    })
  }

  /**
   * Reindexes the specified entity. This will iteratere over all registered queries
   * and ask them to reevaluate the entity.
   *
   * If the `future` parameter is specified,
   * it will be used in the evaluation instead of the entity itself. This is useful
   * if you are about to perform a destructive change on the entity (like removing
   * a component), but want emitted events to still have access to the unmodified entity
   * before the change.
   *
   * @param entity The entity to reindex.
   * @param future The entity that the entity will become in the future.
   */
  reindex(entity: E, future = entity) {
    /* Return early if this world doesn't know about the entity. */
    if (!this.has(entity)) return

    /* Notify all queries about the change. */
    for (const query of this.queries) {
      query.evaluate(entity, future)
    }
  }

  /* IDs */

  private entityToId = new Map<E, number>()
  private idToEntity = new Map<number, E>()
  private nextId = 0

  /**
   * Generate and return a numerical identifier for the given entity. The ID can later
   * be used to retrieve the entity again through the `entity(id)` method.
   *
   * @param entity The entity to get the ID for.
   * @returns An ID for the entity, or undefined if the entity is not in the world.
   */
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

  /**
   * Given an entity ID that was previously generated through the `id(entity)` function,
   * returns the entity matching that ID, or undefined if no such entity exists.
   *
   * @param id The ID of the entity to retrieve.
   * @returns The entity with the given ID, or undefined if no such entity exists.
   */
  entity(id: number) {
    return this.idToEntity.get(id)
  }
}

export class Query<E> extends Bucket<E> implements IQueryableBucket<E> {
  protected _isConnected = false

  /**
   * True if this query is connected to the world, and will automatically
   * re-evaluate when entities are added or removed.
   */
  get isConnected() {
    return this._isConnected
  }

  /**
   * A unique, string-based key for this query, based on its configuration.
   */
  public readonly key: string

  constructor(public world: World, public config: QueryConfiguration) {
    super()

    this.key = configKey(config)

    /* Automatically connect this query if event listeners are added to our
    onEntityAdded or onEntityRemoved events. */
    this.onEntityAdded.onSubscribe.subscribe(() => this.connect())
    this.onEntityRemoved.onSubscribe.subscribe(() => this.connect())
  }

  /**
   * An array containing all entities that match this query. For iteration, it
   * is recommended to use the `for (const entity of query) {}` syntax instead.
   */
  get entities() {
    if (!this._isConnected) this.connect()
    return super.entities
  }

  [Symbol.iterator]() {
    if (!this._isConnected) this.connect()
    return super[Symbol.iterator]()
  }

  /**
   * Connects this query to the world. While connected, it will automatically
   * re-evaluate when entities are added or removed, and store those that match
   * its query configuration.
   *
   * @returns The query object.
   */
  connect() {
    if (!this._isConnected) {
      this._isConnected = true

      /* Evaluate all entities in the world */
      for (const entity of this.world) {
        this.evaluate(entity)
      }
    }

    return this
  }

  /**
   * Disconnects this query from the world. This essentially stops the query from
   * automatically receiving entities.
   */
  disconnect() {
    this._isConnected = false
    return this
  }

  /**
   * Returns a new query that extends this query and also matches entities that
   * have all of the components specified.
   *
   * @param components The components that entities must have.
   * @returns A new query representing the extended query configuration.
   */
  with<C extends keyof E>(...components: C[]) {
    return this.world.query<With<E, C>>({
      ...this.config,
      with: [...this.config.with, ...components]
    })
  }

  /**
   * Returns a new query that extends this query and also matches entities that
   * have none of the components specified.
   *
   * @param components The components that entities must not have.
   * @returns A new query representing the extended query configuration.
   */
  without<C extends keyof E>(...components: C[]) {
    return this.world.query<Without<E, C>>({
      ...this.config,
      without: [...this.config.without, ...components]
    })
  }

  /**
   * Returns a new query that extends this query and also matches entities that
   * match the given predicate.
   *
   * @param predicate The predicate that entities must match.
   * @returns A new query representing the extended query configuration.
   */
  where<D extends E>(predicate: Predicate<E, D>) {
    return this.world.query<D>({
      ...this.config,
      predicates: [...this.config.predicates, predicate]
    })
  }

  /**
   * Checks the given entity against this query's configuration, and returns
   * true if the entity matches the query, false otherwise.
   *
   * @param entity The entity to check.
   * @returns True if the entity matches this query, false otherwise.
   */
  want(entity: E) {
    return (
      this.config.with.every(
        (component) => entity[component as keyof typeof entity] !== undefined
      ) &&
      this.config.without.every(
        (component) => entity[component as keyof typeof entity] === undefined
      ) &&
      this.config.predicates.every((predicate) => predicate(entity))
    )
  }

  /**
   * Evaluate the given entity against this query's configuration, and add or
   * remove it from the query if necessary.
   *
   * If `future` is specified, the entity will be evaluated against that entity
   * instead. This is useful for checking if an entity will match the query
   * after some potentially destructive change has been made to it, before
   * actually applying that change to the entity itself.
   *
   * @param entity The entity to evaluate.
   * @param future The entity to evaluate against. If not specified, the entity will be evaluated against itself.
   */
  evaluate(entity: any, future = entity) {
    if (!this.isConnected) return

    const wanted = this.want(future)
    const has = this.has(entity)

    if (wanted && !has) {
      this.add(entity)
    } else if (!wanted && has) {
      this.remove(entity)
    }
  }
}

const normalizeComponents = (components: any[]) => [
  ...new Set(components.sort().filter((c) => !!c && c !== ""))
]

function normalizePredicates(predicates: Function[]) {
  return [...new Set(predicates)]
}

function normalizeQueryConfiguration(config: QueryConfiguration) {
  return {
    with: normalizeComponents(config.with),
    without: normalizeComponents(config.without),
    predicates: normalizePredicates(config.predicates)
  }
}

function configKey(config: QueryConfiguration) {
  return `${config.with.join(",")}:${config.without.join(
    ","
  )}:${config.predicates.map((p) => id(p)).join(",")}`
}
