import { Bucket } from "./Bucket"

export class PredicateBucket<E> extends Bucket<E> {
  predicate: (entity: E) => boolean

  constructor(predicate: (entity: E) => boolean) {
    super()
    this.predicate = predicate
  }

  add(entity: E) {
    if (!entity) return entity

    if (this.predicate(entity)) {
      super.add(entity)
    }

    return entity
  }
}
