import { SimpleBucket } from "./SimpleBucket"

export type Predicate<E, D extends E> =
  | ((v: E) => v is D)
  | ((entity: E) => boolean)

export class Bucket<E> extends SimpleBucket<E> {
  constructor(
    source: Bucket<any> | E[] = [],
    public predicate: Predicate<any, E> = () => true
  ) {
    super()

    /* If we have a source bucket, add ourselves as a listener. */
    if (source instanceof Bucket) {
      source.onEntityAdded.add(this.add)
      source.onEntityRemoved.add(this.remove)
      this.source = source
    }

    /* Add all entities contained in the source */
    for (const entity of source instanceof Bucket ? source.entities : source) {
      this.add(entity)
    }
  }

  source?: Bucket<any>

  private predicateBuckets = new Map<Predicate<E, any>, Bucket<any>>()

  add<D extends E>(entity: D): D & E {
    if (!this.predicate(entity)) return entity
    return super.add(entity)
  }

  /* TODO: is `test` really the best name? */
  test(entity: E, future = entity) {
    const has = this.has(entity)
    const wants = this.predicate(future)

    if (has && !wants) {
      this.remove(entity)
    } else if (!has && wants) {
      this.add(entity)
    } else if (has && wants) {
      for (const bucket of this.predicateBuckets.values()) {
        bucket.test(entity, future)
      }
    }
  }

  where<D extends E>(predicate: Predicate<E, D>): Bucket<D> {
    /* If we already have a bucket for the given predicate, return it. */
    if (this.predicateBuckets.has(predicate)) {
      return this.predicateBuckets.get(predicate)!
    }

    /* Otherwise, create a new bucket. */
    const bucket = new Bucket(this, predicate)
    this.predicateBuckets.set(predicate, bucket)

    return bucket
  }

  /* DIRTY TRACKING */

  private dirty = new Set<E>()

  mark(entity: E) {
    this.dirty.add(entity)
  }

  flushMarked() {
    for (const entity of this.dirty) this.test(entity)
    this.dirty.clear()
  }

  update<D extends E>(entity: D, fun: (entity: D) => void) {
    fun(entity)
    this.mark(entity)
  }
}
