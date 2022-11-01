import { Bucket } from "@miniplex/bucket"
import { With } from "./types"

export class EntityBucket<E> extends Bucket<E> {
  buckets = new Set<EntityBucket<any>>()

  wants(entity: any): entity is E {
    return true
  }

  archetype<P extends keyof E>(...components: P[]) {
    /* TODO: find and return existing archetype bucket */

    /* Create a new bucket */
    const bucket = new Archetype<With<E, P>>()
    this.buckets.add(bucket)

    this.onEntityAdded.add((e) => {
      if (bucket.wants(e)) {
        bucket.add(e)
      }
    })

    this.onEntityRemoved.add((e) => {
      if (bucket.has(e)) {
        bucket.remove(e)
      }
    })

    return bucket
  }
}

export class Archetype<E> extends EntityBucket<E> {}
