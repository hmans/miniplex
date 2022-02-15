import { commandQueue } from "./util/commandQueue"
import { entityIsArchetype } from "./util/entityIsArchetype"
import { idGenerator } from "./util/idGenerator"
import { ListenerRegistry } from "./util/ListenerRegistry"
import { memoizedMap } from "./util/memoizedMap"

/**
 * A base interface for entities, which are just normal JavaScript objects with
 * any number of properties, each of which represents a single component. When
 * using hmecs, it is recommended to create your own type representing your
 * game's entities, and pass that to `createWorld` for full typing support.
 */
export interface IEntity {
  id?: number
}

/**
 * For situations where no entity type argument is passed to createWorld, we'll
 * default to an untyped entity type that can hold any component.
 */
export type UntypedEntity = { [components: string]: ComponentData } & IEntity

/**
 * Component names are just strings/object property names.
 */
export type ComponentName<T extends IEntity> = keyof T

/**
 * The data of a component can be literally anything. Good times!
 */
export type ComponentData = any

/**
 * miniplex lets you define archetypes of entities. For each archetype,
 * it will automatically create an index; entities matching this archetype
 * will automatically be added to the index, entities no longer matching
 * the archetype will automatically be removed.
 */
export type Archetype<T extends IEntity> = ComponentName<T>[]

/**
 * An archetype index represents a mapping between archetypes to simple lists
 * of entities (of this archetype.)
 */
export type ArchetypeIndex<T extends IEntity> = Map<Archetype<T>, T[]>

type FunctionWithQueuedVariant<
  ImmediateFunction extends { (...args: any[]): any },
  QueuedReturnType = void
> = ImmediateFunction & {
  queued: (...args: Parameters<ImmediateFunction>) => QueuedReturnType
}

type Listeners<T> = {
  listeners: {
    archetypeChanged: Map<Archetype<T>, ListenerRegistry>
  }
}

export type World<T extends IEntity> = {
  entities: T[]
  addEntity: FunctionWithQueuedVariant<(entity: T) => T, T>
  removeEntity: FunctionWithQueuedVariant<(entity: T) => void>
  addComponent: FunctionWithQueuedVariant<
    <U extends keyof T>(entity: T, name: U, data: T[U]) => void
  >
  removeComponent: FunctionWithQueuedVariant<(entity: T, ...names: ComponentName<T>[]) => void>
  createArchetype: (...components: ComponentName<T>[]) => Archetype<T>
  get: (archetype: Archetype<T>) => T[]
  getOne: (archetype: Archetype<T>) => T | undefined
  flushQueue: () => void
  clear: () => void
} & Listeners<T>

/**
 * Create an ECS world.
 */
export function createWorld<T extends IEntity = UntypedEntity>(): World<T> {
  /**
   * An array holding all entities known to this world.
   */
  const entities = new Array<T>()

  let nextId = idGenerator(1)

  /**
   * A register of archetype-specific indices.
   */
  const archetypes = new Map<Archetype<T>, T[]>()

  const listeners = {
    archetypeChanged: new Map<Archetype<T>, ListenerRegistry>()
  }

  /**
   * A useful queue of commands to run.
   */
  const queuedCommands = commandQueue()

  /**
   * A memoization cache for archetypes to help with maintaining
   * referential integrity.
   */
  const memoizedArchetypes = memoizedMap<Archetype<T>>()

  function createArchetype(...components: ComponentName<T>[]): Archetype<T> {
    const normalized = components.sort()

    /* Note: we're only memoizing to make sure that we're always using the same object
       for any combinations of component names that are equal. */
    const archetype = memoizedArchetypes.fetch(normalized, () => normalized)

    /* Create an index if we need to. */
    if (!archetypes.has(archetype)) {
      /* create an index, and index existing entities */
      archetypes.set(
        archetype,
        entities.filter((entity) => entityIsArchetype(entity, archetype))
      )

      /* Create listeners */
      listeners.archetypeChanged.set(archetype, new ListenerRegistry<() => any>())
    }

    return archetype
  }

  function indexEntityWithNewComponents(entity: T, addedComponents: ComponentName<T>[]) {
    /* When one or more components are added to an entity, it can only be _added_ to indices;
       and only those indices that are interested in any of the added components. Let's go! */

    for (const [archetype, index] of archetypes.entries()) {
      /* If this archetype is interested in any of the new components, logic dictates
         that this entity can't possibly already be listed, and only then may we be
         interested in adding it. */
      if (archetype.some((indexedComponent) => addedComponents.includes(indexedComponent))) {
        /* Now we know the index is potentially interested in this entity, so let's check! */
        if (entityIsArchetype(entity, archetype) && !index.includes(entity)) {
          index.push(entity)
          listeners.archetypeChanged.get(archetype)!.invoke()
        }
      }
    }
  }

  function indexEntityWithRemovedComponents(entity: T, removedComponents: ComponentName<T>[]) {
    /* When a component is removed from an entity, logic dictates that the only archetype
       indices that are potentially affected are those interested in any of the removed
       component names, so we only need to check those. */

    for (const [archetype, index] of archetypes.entries()) {
      if (archetype.some((indexedComponent) => removedComponents.includes(indexedComponent))) {
        /* By this point the entity may already be in this index, so let's check if
           it still matches the archetype, and remove it if it doesn't. */
        const pos = index.indexOf(entity, 0)

        if (pos >= 0 && !entityIsArchetype(entity, archetype)) {
          index.splice(pos, 1)
          listeners.archetypeChanged.get(archetype)!.invoke()
        }
      }
    }
  }

  function removeEntityFromAllIndices(entity: T) {
    for (const [archetype, index] of archetypes.entries()) {
      const pos = index.indexOf(entity, 0)

      if (pos >= 0) {
        index.splice(pos, 1)
        listeners.archetypeChanged.get(archetype)!.invoke()
      }
    }
  }

  function get(archetype: Archetype<T>) {
    return archetypes.get(archetype)!
  }

  function getOne(archetype: Archetype<T>) {
    return archetypes.get(archetype)![0]
  }

  const addEntity = (entity: T) => {
    /* If there already is an ID, raise an error. */
    if ("id" in entity) throw "Attempted to add an entity that aleady had an 'id' component."

    /* Assign an ID */
    entity.id = nextId()

    /* Store the entity... */
    entities.push(entity)

    /* ...and add it to relevant indices. */
    indexEntityWithNewComponents(entity, Object.keys(entity) as ComponentName<T>[])

    return entity
  }

  const removeEntity = (entity: T) => {
    /* Remove entity from all indices */
    removeEntityFromAllIndices(entity)

    /* Remove its id component */
    delete entity.id

    /* Remove it from our global list of entities */
    const pos = entities.indexOf(entity, 0)
    entities.splice(pos, 1)
  }

  const addComponent = <U extends ComponentName<T>>(entity: T, name: U, data: T[U]) => {
    entity[name] = data
    indexEntityWithNewComponents(entity, [name])
  }

  const removeComponent = (entity: T, ...components: ComponentName<T>[]) => {
    components.forEach((name) => delete entity[name])
    indexEntityWithRemovedComponents(entity, components)
  }

  /* Queued versions of mutation functions */

  addEntity.queued = (entity: T) => {
    queuedCommands.add(() => addEntity(entity))
    return entity
  }

  removeEntity.queued = (entity: T) => {
    queuedCommands.add(() => removeEntity(entity))
  }

  addComponent.queued = <U extends ComponentName<T>>(entity: T, name: U, data: T[U]) => {
    queuedCommands.add(() => addComponent(entity, name, data))
  }

  removeComponent.queued = (entity: T, ...names: ComponentName<T>[]) => {
    queuedCommands.add(() => removeComponent(entity, ...names))
  }

  /**
   * Clear the entire world by discarding all entities and indices.
   */
  function clear() {
    /* Remove all entities */
    entities.length = 0

    /* Remove all archetype indices */
    archetypes.clear()

    /* Remove all listeners */
    listeners.archetypeChanged.clear()

    /* Clear queue */
    queuedCommands.clear()
  }

  return {
    entities,
    listeners,
    createArchetype,
    get,
    getOne,
    addEntity,
    removeEntity,
    addComponent,
    removeComponent,
    flushQueue: queuedCommands.flush,
    clear
  }
}
