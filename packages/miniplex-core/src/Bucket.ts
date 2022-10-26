import { IEntity } from "./types"

export type BucketOptions<E extends IEntity> = {
  entities?: E[]
}

export class Bucket<E extends IEntity> {
  entities: E[]

  constructor(opts: BucketOptions<E> = {}) {
    this.entities = opts.entities || []
  }

  add(entity: E) {
    this.entities.push(entity)
  }

  remove(entity: E) {
    const index = this.entities.indexOf(entity)

    if (index !== -1) {
      this.entities[index] = this.entities[this.entities.length - 1]
      this.entities.pop()
    }
  }
}
