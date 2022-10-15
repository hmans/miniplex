import { archetype } from "./archetypes"
import { Bucket } from "./Bucket"
import { IEntity } from "./types"

export class World<E extends IEntity> extends Bucket<E> {
  /**
   * Adds a property to an entity.
   * If the entity already has the property, this function will do nothing.
   *
   * @param entity The entity to add the property to.
   * @param property The property to add.
   * @param value The value of the property.
   * @returns `true` if the entity was updated, `false` otherwise.
   */
  addProperty<P extends keyof E>(entity: E, property: P, value: E[P]) {
    if (property in entity) return false

    entity[property] = value
    this.touch(entity)

    return true
  }

  /**
   * Removes a property from an entity. If the entity does not have the property,
   * this function will do nothing.
   *
   * @param entity The entity to remove the property from.
   * @param property The property to remove.
   * @returns `true` if the entity was updated, `false` otherwise.
   */
  removeProperty<P extends keyof E>(entity: E, property: P) {
    if (!(property in entity)) return false

    delete entity[property]
    this.touch(entity)

    return true
  }

  /**
   * Updates the value of a property on the given entity.
   * If the entity does not have the property, this function will do nothing.
   *
   * @param entity The entity to update.
   * @param property The property to update.
   * @param value The new value of the property.
   * @returns `true` if the entity was updated, `false` otherwise.
   */
  setProperty<P extends keyof E>(entity: E, property: P, value: E[P]) {
    if (!(property in entity)) return false

    entity[property] = value
    this.touch(entity)

    return true
  }

  archetype<P extends keyof E>(...properties: P[]) {
    return this.derive(archetype(...properties))
  }
}
