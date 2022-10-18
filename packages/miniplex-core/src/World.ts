import { archetype } from "./archetypes"
import { Bucket } from "./Bucket"
import { IEntity } from "./types"

export class World<E extends IEntity> extends Bucket<E> {
  constructor(...args: ConstructorParameters<typeof Bucket<E>>) {
    super(...args)

    /* Forget the ID again when an entity is removed */
    this.onEntityRemoved.addListener((entity) => {
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
   * Removes a component from an entity. If the entity does not have the component,
   * this function will do nothing.
   *
   * @param entity The entity to remove the component from.
   * @param component The component to remove.
   */
  clearComponent<P extends keyof E>(entity: E, component: P) {
    delete entity[component]
    this.touch(entity)
  }

  /**
   * Updates the value of a component on the given entity.
   * If the entity does not have the component, it is added.
   *
   * @param entity The entity to update.
   * @param component The component to update.
   * @param value The new value of the component.
   */
  setComponent<P extends keyof E>(entity: E, component: P, value: E[P]) {
    entity[component] = value
    this.touch(entity)
  }

  archetype<P extends keyof E>(...components: P[]) {
    return this.derive(archetype(...components))
  }
}
