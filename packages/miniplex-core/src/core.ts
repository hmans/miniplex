import { Bucket } from "@miniplex/bucket"
import { id } from "@hmans/id"
import { createQueue } from "@hmans/queue"
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

  addComponent<C extends keyof E>(entity: E, component: C, value: E[C]) {
    /* Return early if the entity already has the component. */
    if (entity[component] !== undefined) return

    /* Set the component */
    entity[component] = value

    /* Trigger a reindexing */
    this.reindex(entity)
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

  /* QUERIES */

  protected queries = new Set<Query<any>>()

  // TODO: maybe rename this to something scarier, like `produceQuery`? Users are not expected to use this directly.
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

  with<C extends keyof E>(...components: C[]) {
    return this.query<With<E, C>>({
      with: components,
      without: [],
      predicates: []
    })
  }

  without<C extends keyof E>(...components: C[]) {
    return this.query<Without<E, C>>({
      with: [],
      without: components,
      predicates: []
    })
  }

  where<D extends E>(predicate: Predicate<E, D>) {
    return this.query<D>({
      with: [],
      without: [],
      predicates: [predicate]
    })
  }

  protected reindex(entity: E, future = entity) {
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

  get entities() {
    if (!this._isConnected) this.connect()
    return super.entities
  }

  [Symbol.iterator]() {
    if (!this._isConnected) this.connect()
    return super[Symbol.iterator]()
  }

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

  disconnect() {
    this._isConnected = false
    return this
  }

  with<C extends keyof E>(...components: C[]) {
    return this.world.query<With<E, C>>({
      ...this.config,
      with: [...this.config.with, ...components]
    })
  }

  without<C extends keyof E>(...components: C[]) {
    return this.world.query<Without<E, C>>({
      ...this.config,
      without: [...this.config.without, ...components]
    })
  }

  where<D extends E>(predicate: Predicate<E, D>) {
    return this.world.query<D>({
      ...this.config,
      predicates: [...this.config.predicates, predicate]
    })
  }

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

export class Monitor<E> {
  protected queueSetup = createQueue()
  protected queueTeardown = createQueue()

  protected queueDisconnect = createQueue()

  constructor(
    public query: Query<E>,
    protected setup: (entity: E) => void,
    protected teardown: (entity: E) => void
  ) {
    this.connect()
  }

  connect() {
    /* Setup all existing entities */
    for (const entity of this.query) {
      this.queueSetup(() => this.setup(entity))
    }

    /* Setup new entities as they are added */
    this.queueDisconnect(
      this.query.onEntityAdded.subscribe((entity) => {
        this.queueSetup(() => this.setup(entity))
      })
    )

    /* Teardown entities as they are removed */
    this.queueDisconnect(
      this.query.onEntityRemoved.subscribe((entity) => {
        this.queueSetup(() => this.teardown(entity))
      })
    )
  }

  disconnect() {
    this.queueDisconnect.flush()
  }

  run() {
    this.queueSetup.flush()
    this.queueTeardown.flush()
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
