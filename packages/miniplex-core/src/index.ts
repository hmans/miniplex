import { Bucket } from "@miniplex/bucket"
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

export class World<E extends {} = any> extends Bucket<E> {
  connectedQueries = new Set<Query<any>>()

  constructor(entities: E[] = []) {
    super(entities)

    /* When entities are added, reindex them immediately */
    this.onEntityAdded.subscribe((entity) => {
      this.reindex(entity)
    })

    /* When entities are removed, also make sure to forget about their IDs. */
    this.onEntityRemoved.subscribe((entity) => {
      /* Remove the entity from the ID map */
      if (this.entityToId.has(entity)) {
        const id = this.entityToId.get(entity)!
        this.idToEntity.delete(id)
        this.entityToId.delete(entity)
      }
    })
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

  with<C extends keyof E>(...components: C[]): Query<With<E, C>> {
    return new Query(this, {
      with: components,
      without: []
    })
  }

  without<C extends keyof E>(...components: C[]): Query<Without<E, C>> {
    return new Query(this, {
      with: [],
      without: components as any
    })
  }

  protected reindex(entity: E, future = entity) {
    for (const query of this.connectedQueries) {
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

export const normalizeComponents = (components: any[]) => [
  ...new Set(components.sort().filter((c) => !!c && c !== ""))
]

export const normalizeQuery = (query: QueryConfiguration<any>) =>
  ({
    with: query.with !== undefined ? normalizeComponents(query.with) : [],
    without:
      query.without !== undefined ? normalizeComponents(query.without) : []
  } as typeof query)

export type QueryConfiguration<E> = {
  with: (keyof E)[]
  without: (keyof E)[]
  filter?: Predicate<E, any>
}

export class Query<E> extends Bucket<E> {
  public connected = false

  constructor(public world: World, public config: QueryConfiguration<E>) {
    super()

    this.onEntityAdded.onSubscribe.subscribe(() => this.connect())
    this.onEntityRemoved.onSubscribe.subscribe(() => this.connect())
  }

  get entities() {
    if (!this.connected) this.connect()
    return super.entities
  }

  [Symbol.iterator]() {
    if (!this.connected) this.connect()
    return super[Symbol.iterator]()
  }

  connect() {
    if (this.connected) return
    this.connected = true

    this.world.connectedQueries.add(this)

    for (const entity of this.world) {
      if (this.want(entity)) {
        this.add(entity)
      }
    }
  }

  disconnect() {
    if (!this.connected) return
    this.connected = false

    this.world.connectedQueries.delete(this)
  }

  with<C extends keyof E>(...components: C[]): Query<With<E, C>> {
    return new Query(this.world, {
      ...this.config,
      with: [...this.config.with, ...components]
    }) as any
  }

  without<C extends keyof E>(...components: C[]): Query<Without<E, C>> {
    return new Query(this.world, {
      ...this.config,
      without: [...this.config.without, ...components]
    }) as any // TODO: resolve `any`
  }

  want(entity: E) {
    return (
      this.config.with.every((component) => entity[component] !== undefined) &&
      this.config.without.every((component) => entity[component] === undefined)
    )
  }

  evaluate(entity: any, future = entity) {
    const wanted = this.want(future)
    const has = this.has(entity)

    if (wanted && !has) {
      this.add(entity)
    } else if (!wanted && has) {
      this.remove(entity)
    }
  }
}
