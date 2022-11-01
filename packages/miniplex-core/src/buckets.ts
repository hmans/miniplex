import { Bucket } from "@miniplex/bucket"
import { With } from "./types"

export class EntityBucket<E> extends Bucket<E> {
  buckets = new Set<EntityBucket<any>>()

  wants(entity: any): entity is E {
    return true
  }

  addBucket<D extends E>(bucket: EntityBucket<D>) {
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

  archetype<P extends keyof E>(...components: P[]): Archetype<With<E, P>> {
    /* TODO: find and return existing archetype bucket */

    /* Create a new bucket */
    return this.addBucket(new Archetype())
  }
}

export class Archetype<E> extends EntityBucket<E> {}
