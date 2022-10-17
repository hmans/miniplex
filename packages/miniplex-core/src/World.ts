import { archetype } from "./archetypes"
import { Bucket } from "./Bucket"
import { IEntity } from "./types"

export class World<E extends IEntity> extends Bucket<E> {
  private nextId = 0

  private entityToId = new Map<E, number>()
  private idToEntity = new Map<number, E>()

  id(entity: E) {
    return this.entityToId.get(entity)!
  }

  entity(id: number) {
    return this.idToEntity.get(id)!
  }

  constructor(...args: ConstructorParameters<typeof Bucket<E>>) {
    super(...args)

    this.onEntityAdded.addListener((entity) => {
      this.entityToId.set(entity, this.nextId)
      this.idToEntity.set(this.nextId, entity)
      this.nextId++
    })

    this.onEntityRemoved.addListener((entity) => {
      this.idToEntity.delete(this.entityToId.get(entity)!)
      this.entityToId.delete(entity)
    })
  }

  /**
   * Adds a component to an entity.
   * If the entity already has the component, this function will do nothing.
   *
   * @param entity The entity to add the property to.
   * @param component The component to add.
   * @param value The value of the component.
   * @returns `true` if the entity was updated, `false` otherwise.
   */
  addComponent<P extends keyof E>(entity: E, component: P, value: E[P]) {
    if (entity[component] !== undefined) return false

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
    if (entity[component] === undefined) return false

    entity[component] = value
    this.touch(entity)

    return true
  }

  archetype<P extends keyof E>(...components: P[]) {
    return this.derive(archetype(...components))
  }
}
