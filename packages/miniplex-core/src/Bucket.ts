import { IEntity } from "./types"

export type BucketOptions<E extends IEntity> = {
  entities?: E[]
}

export class Bucket<E extends IEntity> {
  entities: E[]

  constructor(opts: BucketOptions<E> = {}) {
    this.entities = opts.entities || []
  }
}
