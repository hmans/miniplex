import { Bucket } from "./Bucket"
import { IEntity } from "./types"

/**
 * `World` is a special type of `Bucket` that manages ECS-like entities.
 * It provides an API for adding and removing components to and from entities,
 * as well as an `archetype` function that will return a derived bucket
 * containing all entities of the specified archetype (ie. that have all of
 * the specified components.)
 */
export class World<E extends IEntity> extends Bucket<E> {
  constructor(...args: ConstructorParameters<typeof Bucket<E>>) {
    super(...args)

    /* Forget the ID again when an entity is removed */
    this.onEntityRemoved.add((entity) => {
      if (this.entityToId.has(entity)) {
        this.idToEntity.delete(this.entityToId.get(entity)!)
        this.entityToId.delete(entity)
      }
    })
  }

  /* ID generation */
  private nextId = 0
  private entityToId = new Map<E, number>()
  private idToEntity = new Map<number, E>()

  /**
   * Returns the ID of the given entity. If the entity is not known to this world,
   * it returns `undefined`.
   *
   * @param entity The entity to get the ID of.
   * @returns The ID of the entity, or `undefined` if the entity is not known to this world.
   */
  id(entity: E) {
    /* Only return IDs for entities we know about */
    if (!this.has(entity)) return undefined

    /* Return existing ID if we have one */
    const id = this.entityToId.get(entity)
    if (id !== undefined) return id

    this.entityToId.set(entity, this.nextId)
    this.idToEntity.set(this.nextId, entity)
    return this.nextId++
  }

  /**
   * Given an ID, returns the entity with that ID. If the ID is not known to this world,
   * it returns `undefined`.
   *
   * @param id The ID of the entity to get.
   * @returns The entity with the given ID, or `undefined` if the ID is not known to this world.
   */
  entity(id: number) {
    return this.idToEntity.get(id)
  }

  /**
   * Adds a component to an entity.
   * If the entity already has the component, this function will log a warning
   * and return `false`. Otherwise, it will add the component and return `true`.
   *
   * @param entity The entity to add the property to.
   * @param component The component to add.
   * @param value The value of the component.
   * @returns `true` if the entity was updated, `false` otherwise.
   */
  addComponent<P extends keyof E>(entity: E, component: P, value: E[P]) {
    if (entity[component] !== undefined) {
      console.warn(
        "Tried to add a component, but it was already present:",
        component
      )

      return false
    }

    entity[component] = value
    this.touch(entity)

    return true
  }

  /**
   * Removes a component from an entity. If the entity does not have the component,
   * this function will do nothing.
   *
   * @param entity The entity to remove the component from.
   * @param component The component to remove.
   * @returns `true` if the entity was updated, `false` otherwise.
   */
  removeComponent<P extends keyof E>(entity: E, component: P) {
    if (entity[component] === undefined) return false

    delete entity[component]
    this.touch(entity)

    return true
  }

  /**
   * Updates the value of a component on the given entity.
   * If the entity does not have the component, this function will do nothing.
   *
   * @param entity The entity to update.
   * @param component The component to update.
   * @param value The new value of the component.
   * @returns `true` if the entity was updated, `false` otherwise.
   */
  setComponent<P extends keyof E>(entity: E, component: P, value: E[P]) {
    if (entity[component] === undefined) {
      console.warn("Tried to set a component, but it was missing:", component)
      return false
    }

    entity[component] = value
    this.touch(entity)

    return true
  }
}
