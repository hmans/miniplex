import { commandQueue } from "./util/commandQueue"
import { entityIsArchetype } from "./util/entityIsArchetype"
import { idGenerator } from "./util/idGenerator"
import { ListenerRegistry } from "./util/ListenerRegistry"
import { memoizedMap } from "./util/memoizedMap"

/**
 * A base interface for entities, which are just normal JavaScript objects with
 * any number of properties, each of which represents a single component. When
 * using hmecs, it is recommended to create your own type representing your
 * game's entities, and pass that to `createECS` for full typing support.
 */
export interface IEntity {
  id?: number
}

/**
 * Component names are just strings/object property names.
 */
export type ComponentName<T extends IEntity> = keyof T

/**
 * The data of a component can be literally anything. Good times!
 */
export type ComponentData = any

/**
 * hmecs lets you define archetypes of entities. For each archetype,
 * it will automatically create an index; entities matching this archetype
 * will automatically be added to the index, entities no longer matching
 * the archetype will automatically be removed.
 */
export type Archetype<T extends IEntity> = ComponentName<T>[]

export type ArchetypeIndex<T extends IEntity> = Map<Archetype<T>, T[]>

type ImmediateAPI<T> = {
  addEntity: (entity: T) => T
  removeEntity: (entity: T) => void
  addComponent: (entity: T, change: Partial<T>) => void
  removeComponent: (entity: T, ...names: ComponentName<T>[]) => void
}

type Listeners<T> = {
  listeners: {
    archetypeChanged: Map<Archetype<T>, ListenerRegistry>
  }
}

export type ECS<T extends IEntity> = {
  entities: T[]
  immediately: ImmediateAPI<T>
  archetype: (...components: ComponentName<T>[]) => Archetype<T>
  get: (archetype: Archetype<T>) => T[]
  flush: () => void
} & ImmediateAPI<T> &
  Listeners<T>

export function createECS<T extends IEntity>(): ECS<T> {
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
  const queue = commandQueue()

  /**
   * A memoization cache for archetypes to help with maintaining
   * referential integrity.
   */
  const memoizedArchetypes = memoizedMap<Archetype<T>>()

  function archetype(...components: ComponentName<T>[]): Archetype<T> {
    const normalized = components.sort()

    /* Note: we're only memoizing to make sure that we're always using the same object
       for any combinations of component names that are equal. */
    const archetype = memoizedArchetypes.fetch(normalized, () => normalized)

    /* Create an index if we need to. */
    if (!archetypes.has(archetype)) {
      // console.debug("[hmecs] Creating archetype index for:", archetype)

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

  function get(archetype: Archetype<T>) {
    return archetypes.get(archetype)!
  }

  /**
   * A bag of functions that will immediately mutate the ECS world.
   * In most situations, you will probably want to call their
   * non-immediate counterparts.
   */
  const immediately = {
    addEntity: (entity: T) => {
      entities.push(entity)
      indexEntity(entity)

      return entity
    },

    removeEntity: (entity: T) => {
      /* Remove entity from all indices */
      removeEntityFromAllIndices(entity)

      /* Remove it from our global list of entities */
      const pos = entities.indexOf(entity, 0)
      entities.splice(pos, 1)
    },

    addComponent: (entity: T, change: Partial<T>) => {
      Object.assign(entity, change)
      indexEntity(entity)
    },

    removeComponent: (entity: T, ...names: ComponentName<T>[]) => {
      names.forEach((name) => delete entity[name])
      indexEntity(entity)
    }
  }

  function addIdToEntity(entity: T) {
    if (!("id" in entity)) entity.id = nextId()
    return entity
  }

  function addEntity(input: T) {
    const entity = addIdToEntity(input)
    queue.add(() => immediately.addEntity(entity))
    return entity
  }

  function removeEntity(entity: T) {
    queue.add(() => immediately.removeEntity(entity))
  }

  function addComponent(entity: T, change: Partial<T>) {
    queue.add(() => immediately.addComponent(entity, change))
  }

  function removeComponent(entity: T, ...names: ComponentName<T>[]) {
    queue.add(() => immediately.removeComponent(entity, ...names))
  }

  function flush() {
    queue.flush()
  }

  function indexEntity(entity: T) {
    for (const [archetype, index] of archetypes.entries()) {
      /* Current position in index */
      const pos = index.indexOf(entity, 0)

      const isArchetype = entityIsArchetype(entity, archetype)

      /* If the entity is in this index but no longer matches, remove it. */
      if (pos >= 0 && !isArchetype) {
        index.splice(pos, 1)
        listeners.archetypeChanged.get(archetype)?.invoke()
        continue
      }

      /* If the entity is not in this index but matches the archetype, add it. */
      if (pos < 0 && isArchetype) {
        index.push(entity)
        listeners.archetypeChanged.get(archetype)?.invoke()
        continue
      }
    }
  }

  function removeEntityFromAllIndices(entity: T) {
    for (const [archetype, index] of archetypes.entries()) {
      const pos = index.indexOf(entity, 0)
      if (pos >= 0) index.splice(pos, 1)
    }
  }

  return {
    entities,
    listeners,
    archetype,
    get,
    addEntity,
    removeEntity,
    addComponent,
    removeComponent,
    immediately,
    flush
  }
}
