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

export function createECS<T extends IEntity = UntypedEntity>(): ECS<T> {
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
      if (!("id" in entity)) entity.id = nextId()
      entities.push(entity)
      indexEntityWithNewComponents(entity, Object.keys(entity) as ComponentName<T>[])

      return entity
    },

    removeEntity: (entity: T) => {
      /* Remove entity from all indices */
      removeEntityFromAllIndices(entity)

      /* Remove it from our global list of entities */
      const pos = entities.indexOf(entity, 0)

      entities[pos] = entities[entities.length - 1]
      entities.pop()
    },

    addComponent: (entity: T, change: Partial<T>) => {
      Object.assign(entity, change)
      indexEntityWithNewComponents(entity, Object.keys(entity) as ComponentName<T>[])
    },

    removeComponent: (entity: T, ...components: ComponentName<T>[]) => {
      components.forEach((name) => delete entity[name])
      indexEntityWithRemovedComponents(entity, components)
    }
  }

  function addEntity(entity: T) {
    if (!("id" in entity)) entity.id = nextId()
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

  function indexEntityWithNewComponents(entity: T, addedComponents: ComponentName<T>[]) {
    /* When one or more components are added to an entity, it can only be _added_ to indices;
       and only those indices that are interested in any of the added components. Let's go! */

    for (const [archetype, index] of archetypes.entries()) {
      /* If this archetype is interested in any of the new components, logic dictates
         that this entity can't possibly already be listed, and only then may we be
         interested in adding it. */
      if (archetype.some((indexedComponent) => addedComponents.includes(indexedComponent))) {
        /* Now we know the index is potentially interested in this entity, so let's check! */
        if (entityIsArchetype(entity, archetype)) {
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
        /* By this point the entity _must_ already be in this index, so let's check if
           it still matches the archetype, and remove it if it doesn't. */
        if (!entityIsArchetype(entity, archetype)) {
          index[index.indexOf(entity)] = index[index.length - 1]
          index.pop()

          listeners.archetypeChanged.get(archetype)!.invoke()
        }
      }
    }
  }

  function removeEntityFromAllIndices(entity: T) {
    for (const [archetype, index] of archetypes.entries()) {
      const pos = index.indexOf(entity, 0)
      if (pos >= 0) {
        index[pos] = index[index.length - 1]
        index.pop()

        listeners.archetypeChanged.get(archetype)!.invoke()
      }
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
