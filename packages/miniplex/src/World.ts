import { archetype } from "./archetypes"
import { Bucket } from "./Bucket"
import { IEntity } from "./types"

export class World<E extends IEntity> extends Bucket<E> {
  addProperty<P extends keyof E>(entity: E, property: P, value: E[P]) {
    if (property in entity) return

    entity[property] = value
    this.touch(entity)
  }

  removeProperty<P extends keyof E>(entity: E, property: P) {
    if (!(property in entity)) return

    delete entity[property]
    this.touch(entity)
  }

  archetype<P extends keyof E>(...properties: P[]) {
    return this.derive(archetype(...properties))
  }
}
