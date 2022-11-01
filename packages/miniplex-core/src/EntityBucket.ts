import { Bucket } from "@miniplex/bucket"
import { ArchetypeBucket } from "./ArchetypeBucket"
import { With } from "./types"

export class EntityBucket<E> extends Bucket<E> {
  wants(entity: E): boolean {
    return true
  }

  archetype<P extends keyof E>(...components: P[]) {
    return new ArchetypeBucket<With<E, P>>()
  }
}
