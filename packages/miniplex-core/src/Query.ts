import { Bucket } from "@miniplex/bucket"
import { IEntity, PredicateFunction } from "./types"

export class Query<E extends IEntity, D extends E> extends Bucket<D> {
  constructor(public predicate: PredicateFunction<E, D>) {
    super()
  }
}
