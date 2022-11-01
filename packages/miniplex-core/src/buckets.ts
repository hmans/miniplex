import { Bucket } from "@miniplex/bucket"
import { With } from "./types"

export class EntityBucket<E> extends Bucket<E> {
  buckets = new Set<EntityBucket<any>>()

  wants(entity: E): boolean {
    return true
  }

  archetype<P extends keyof E>(...components: P[]) {
    /* TODO: find and return existing archetype bucket */

    /* Create a new bucket */
    const bucket = new Archetype<With<E, P>>()
    this.buckets.add(bucket)
    return bucket
  }
}

export class Archetype<E> extends EntityBucket<E> {}
