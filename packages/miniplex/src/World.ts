import { Bucket, IEntity } from "./Bucket"

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
}
