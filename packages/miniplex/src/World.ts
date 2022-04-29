import { Archetype, Query } from "./Archetype"
import { commandQueue } from "./util/commandQueue"
import { normalizeQuery } from "./util/normalizeQuery"
import { WithRequiredKeys } from "./util/types"

export type EntityID = number

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
  __miniplex: {
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
  public entities = new Array<RegisteredEntity<T> | null>()

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
      if (entity) archetype.indexEntity(entity)
    }

    return archetype as Archetype<T, TQuery>
  }

  private indexEntity(entity: RegisteredEntity<T>) {
    for (const archetype of this.archetypes.values()) {
      archetype.indexEntity(entity)
    }
  }

  public getEntity(id: EntityID) {
    /* Try and get the entity from our list of entities. */
    const entity = this.entities[id]

    /*
    The entity might have previously been destroyed, or the ID may simply
    be invalid. Let's deal with that now.
    */
    if (!entity) {
      throw new Error(
        `Attempted to delete entity with ID ${id}, but entity was null`
      )
    }

    return entity
  }

  /* MUTATION FUNCTIONS */

  public createEntity = <P>(
    entity: T = {} as T,
    ...extraComponents: Partial<T>[]
  ): number => {
    /* Mix in extra components into entity. */
    for (const extra of extraComponents) {
      Object.assign(entity, extra)
    }

    /* Mix in internal component into entity. */
    const registeredEntity = Object.assign(entity, {
      __miniplex: {
        archetypes: []
      }
    })

    /* Store the entity... */
    this.entities.push(registeredEntity)

    /* ...and add it to relevant indices. */
    this.indexEntity(registeredEntity)

    /* Return the ID. Since we only ever append to the array of entities,
    we can use the array length here. */
    return this.entities.length - 1
  }

  public destroyEntity = (id: EntityID) => {
    const entity = this.getEntity(id)

    /* Null the entity. */
    this.entities[id] = null

    /* Remove entity from all archetypes */
    for (const archetype of entity.__miniplex.archetypes) {
      archetype.removeEntity(entity)
    }

    /* Remove its miniplex component */
    delete (entity as T).__miniplex
  }

  public addComponent = (id: EntityID, ...partials: Partial<T>[]) => {
    const entity = this.getEntity(id)

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
    id: EntityID,
    ...components: ComponentName<T>[]
  ) => {
    const entity = this.getEntity(id)

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
    createEntity: (entity: T) => {
      this.queuedCommands.add(() => this.createEntity(entity))
    },

    destroyEntity: (id: EntityID) => {
      this.queuedCommands.add(() => this.destroyEntity(id))
    },

    addComponent: (id: EntityID, ...partials: Partial<T>[]) => {
      this.queuedCommands.add(() => this.addComponent(id, ...partials))
    },

    removeComponent: (id: EntityID, ...names: ComponentName<T>[]) => {
      this.queuedCommands.add(() => this.removeComponent(id, ...names))
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
