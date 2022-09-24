import { Archetype, Query } from "./Archetype"
import { commandQueue } from "./util/commandQueue"
import { normalizeQuery } from "./util/normalizeQuery"
import { removeFromList } from "./util/removeFromList"
import { WithRequiredKeys } from "./util/types"

/**
 * Entities in Miniplex are just plain old Javascript objects. We are assuming
 * map-like objects that use string-based properties to identify individual components.
 */
export interface IEntity {
  [key: string]: any
}

/**
 * Miniplex uses an internal component that it will automatically add to all created
 * entities.
 */
export type MiniplexComponent<T extends IEntity> = {
  __miniplex: {
    id: number
    world: World<T>
    archetypes: Archetype<T>[]
  }
}

/**
 * A RegisteredEntity is an entity that has been registered with a world (and thus was blessed
 * with the __miniplex component).
 */
export type RegisteredEntity<T extends IEntity> = T & MiniplexComponent<T>

/**
 * For situations where no entity type argument is passed to createWorld, we'll
 * default to an untyped entity type that can hold any component.
 */
export type UntypedEntity = IEntity

/**
 * Component names are just strings/object property names.
 */
export type ComponentName<T extends IEntity> = keyof T

/**
 * Utility type that represents an Entity that is guaranteed to have the specified
 * component(s) available.
 */
export type EntityWith<
  E extends IEntity,
  C extends ComponentName<E>
> = WithRequiredKeys<E, C> & E

/**
 * A tag is just an "empty" component. For convenience and nicer type support, we're
 * providing a Tag type and constant, both of which are simply equal to `true`.
 */
export const Tag = true
export type Tag = true

export class World<T extends IEntity = UntypedEntity> {
  /** An array holding all entities known to this world. */
  public entities = new Array<RegisteredEntity<T>>()

  /** The ID assigned to the next entity. */
  private nextId = 0

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
    /*
    We absolutely never want to add entities to our indices that are not actually
    part of this world, so let's do a sanity check.
    */
    if (entity.__miniplex.world !== this) return

    for (const archetype of this.archetypes.values()) {
      archetype.indexEntity(entity)
    }
  }

  /* MUTATION FUNCTIONS */

  public createEntity<I extends T>(entity: I): RegisteredEntity<T> & I {
    /* Mix in internal component into entity. */
    const registeredEntity = Object.assign(entity, {
      __miniplex: {
        id: this.nextId++,
        world: this,
        archetypes: []
      }
    })

    /* Store the entity... */
    this.entities.push(registeredEntity)

    /* ...and add it to relevant indices. */
    this.indexEntity(registeredEntity)

    return registeredEntity
  }

  public destroyEntity = (entity: RegisteredEntity<T>) => {
    if (entity.__miniplex?.world !== this) return

    /* Remove it from our global list of entities */
    removeFromList(this.entities, entity)

    /* Remove entity from all archetypes */
    for (let i = entity.__miniplex.archetypes.length - 1; i >= 0; i--) {
      const archetype = entity.__miniplex.archetypes[i]
      archetype.removeEntity(entity)
    }

    /* Remove its miniplex component */
    delete (entity as T).__miniplex
  }

  public addComponent = (
    entity: RegisteredEntity<T>,
    ...partials: Partial<T>[]
  ) => {
    /* Sanity check */
    if (entity.__miniplex?.world !== this) {
      throw new Error(
        `Tried to add components to an entity that is not managed by this world.`
      )
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
    if (entity.__miniplex?.world !== this) {
      throw new Error(
        `Tried to remove ${components} from an entity that is not managed by this world.`
      )
    }

    for (const name of components) {
      if (!(name in entity)) {
        throw new Error(
          `Tried to remove component "${String(
            name
          )} from an entity that doesn't have it.`
        )
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

    destroyEntity: (entity: RegisteredEntity<T> | T) => {
      this.queuedCommands.add(() =>
        this.destroyEntity(entity as RegisteredEntity<T>)
      )
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

    /* Remove all entities from all archetypes, but keep them around in case they are referenced */
    for (const archetype of this.archetypes.values()) {
      archetype.entities.length = 0
    }

    /* Clear queue */
    this.queuedCommands.clear()
  }
}
