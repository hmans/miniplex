import { Archetype, Query } from "./Archetype"
import { commandQueue } from "./util/commandQueue"
import { idGenerator } from "./util/idGenerator"
import { normalizeQuery } from "./util/normalizeQuery"
import { WithRequiredKeys } from "./util/types"

/**
 * Entities in Miniplex are just plain old Javascript objects. We are assuming
 * map-like objects that use string-based properties to identify individual components.
 */
export interface IEntity {
  [key: string]: ComponentData
}

/**
 * Miniplex uses an internal component that it will automatically add to all created
 * entities.
 */
export type MiniplexComponent<T> = {
  miniplex: {
    id: number
    world: World<T>
    archetypes: Archetype<T>[]
  }
}

export type RegisteredEntity<T extends IEntity> = T & MiniplexComponent<T>

/**
 * For situations where no entity type argument is passed to createWorld, we'll
 * default to an untyped entity type that can hold any component.
 */
export type UntypedEntity = { [components: string]: ComponentData }

/**
 * Component names are just strings/object property names.
 */
export type ComponentName<T extends IEntity> = keyof T

/**
 * The data of a component can be literally anything. Good times!
 */
export type ComponentData = any

/**
 * Utility type that represents an Entity that is guaranteed to have the specified
 * component(s) available.
 */
export type EntityWith<
  TEntity extends IEntity,
  TComponents extends ComponentName<TEntity>
> = WithRequiredKeys<TEntity, TComponents> & TEntity

/**
 * A tag is just an "empty" component. For convenience and nicer type support, we're
 * providing a Tag type and constant, both of which are simply equal to `true`.
 */
export const Tag = true
export type Tag = true

export class World<T extends IEntity = UntypedEntity> {
  /** An array holding all entities known to this world. */
  public entities = new Array<RegisteredEntity<T>>()

  /** An ID generator we use for assigning IDs to newly added entities. */
  private nextId = idGenerator(1)

  /** A list of known archetypes. */
  private archetypes = new Map<string, Archetype<T>>()

  public archetype<TQuery extends Query<T>>(
    ...query: TQuery
  ): Archetype<T, TQuery> {
    const normalizedQuery = normalizeQuery(query)
    const stringifiedQuery = JSON.stringify(normalizedQuery)

    /* We may already have an archetype representing the same query */
    if (this.archetypes.has(stringifiedQuery)) {
      return this.archetypes.get(stringifiedQuery) as Archetype<T, TQuery>
    }

    /* Once we reach this point, we need to create a new archetype... */
    const archetype = new Archetype<T>(normalizedQuery)
    this.archetypes.set(stringifiedQuery, archetype)

    /* ...and refresh the indexing of all our entities. */
    for (const entity of this.entities) {
      archetype.indexEntity(entity)
    }

    return archetype as Archetype<T, TQuery>
  }

  private indexEntity(entity: RegisteredEntity<T>) {
    /*
    We absolutely never want to add entities to our indices that are not actually
    part of this world, so let's do a sanity check.
    */
    if (entity.miniplex.world !== this) return

    for (const archetype of this.archetypes.values()) {
      archetype.indexEntity(entity)
    }
  }

  /* MUTATION FUNCTIONS */

  public createEntity = (partial: T = {} as T): RegisteredEntity<T> => {
    /* If there already is a miniplex component on this, bail */
    if ("miniplex" in partial) {
      throw new Error(
        "Attempted to add an entity that aleady has a `miniplex` comonent."
      )
    }

    const entity = partial as RegisteredEntity<T>

    /* Assign an ID */
    entity.miniplex = {
      id: this.nextId(),
      world: this,
      archetypes: []
    }

    /* Store the entity... */
    this.entities.push(entity)

    /* ...and add it to relevant indices. */
    this.indexEntity(entity)

    return entity
  }

  public destroyEntity = (entity: RegisteredEntity<T>) => {
    if (entity.miniplex.world !== this) return

    /* Remove it from our global list of entities */
    const pos = this.entities.indexOf(entity, 0)
    this.entities.splice(pos, 1)

    /* Remove entity from all archetypes */
    for (const archetype of entity.miniplex.archetypes) {
      archetype.removeEntity(entity)
    }

    /* Remove its miniplex component */
    delete (entity as T).miniplex
  }

  public addComponent = (
    entity: RegisteredEntity<T>,
    ...partials: Partial<T>[]
  ) => {
    /* Sanity check */
    if (entity.miniplex.world !== this) {
      throw `Tried to add components to an entity that is not managed by this world.`
    }

    for (const partial of partials) {
      for (const name in partial) {
        if (name in entity) {
          throw new Error(
            `Component "${name}" is already present in entity. Aborting!`
          )
        }

        /* Set entity */
        entity[name] = partial[name]!
      }
    }

    /* Trigger a reindexing of the entity */
    this.indexEntity(entity)
  }

  public removeComponent = (
    entity: RegisteredEntity<T>,
    ...components: ComponentName<T>[]
  ) => {
    if (entity.miniplex.world !== this) {
      throw `Tried to remove ${components} from an entity that is not managed by this world.`
    }

    for (const name of components) {
      if (!(name in entity)) {
        throw `Tried to remove component "${name} from an entity that doesn't have it.`
      }

      delete entity[name]
    }

    this.indexEntity(entity)
  }

  /* QUEUED MUTATION FUNCTIONS */

  /**
   * A queue of commands to run.
   */
  private queuedCommands = commandQueue()

  public queue = {
    createEntity: (entity: T): T & Partial<MiniplexComponent<T>> => {
      this.queuedCommands.add(() => this.createEntity(entity))
      return entity
    },

    destroyEntity: (entity: RegisteredEntity<T>) => {
      this.queuedCommands.add(() => this.destroyEntity(entity))
    },

    addComponent: (entity: RegisteredEntity<T>, ...partials: Partial<T>[]) => {
      this.queuedCommands.add(() => this.addComponent(entity, ...partials))
    },

    removeComponent: (
      entity: RegisteredEntity<T>,
      ...names: ComponentName<T>[]
    ) => {
      this.queuedCommands.add(() => this.removeComponent(entity, ...names))
    },

    flush: () => {
      this.queuedCommands.flush()
    }
  }

  /**
   * Clear the entire world by discarding all entities and indices.
   */
  public clear() {
    /* Remove all entities */
    this.entities.length = 0

    /* Remove all archetype indices */
    this.archetypes.clear()

    /* Clear queue */
    this.queuedCommands.clear()
  }
}
