import { Bucket } from "./Bucket"

export type Predicate<E, D extends E> =
  | ((v: E) => v is D)
  | ((entity: E) => boolean)

export class DerivableBucket<E> extends Bucket<E> {
  derivedBuckets = new Map<Predicate<E, any>, DerivableBucket<any>>()

  where<D extends E>(predicate: Predicate<E, D>): DerivableBucket<D> {
    if (this.derivedBuckets.has(predicate)) {
      return this.derivedBuckets.get(predicate)!
    }

    const bucket = new DerivableBucket<D>()
    this.derivedBuckets.set(predicate, bucket)

    for (const entity of this.entities) {
      if (predicate(entity)) {
        bucket.add(entity)
      }
    }

    return bucket
  }
}
