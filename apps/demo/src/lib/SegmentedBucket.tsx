import { useConst } from "@hmans/use-const"
import { Bucket } from "miniplex"

export class SegmentedBucket<E> extends Bucket<Bucket<E>> {
  private entityToSegment = new Map<E, Bucket<E>>()
  private counter = 0
  private current = 0

  constructor(
    public source: Bucket<E>,
    public segments = 30,
    public limit = 100
  ) {
    super()

    /* Create segments */
    for (let i = 0; i < segments; i++) {
      this.add(new Bucket<E>())
    }

    const add = (entity: E) => {
      const segment = this.entities[this.current]

      segment.add(entity)
      this.entityToSegment.set(entity, segment)
      this.counter++

      if (this.counter >= this.limit) {
        this.counter = 0
        this.current = (this.current + 1) % this.segments
      }
    }

    const remove = (entity: E) => {
      const segment = this.entityToSegment.get(entity)
      if (segment) {
        segment.remove(entity)
        this.entityToSegment.delete(entity)
      }
    }

    /* Transfer existing entities */
    for (const entity of source) add(entity)

    source.onEntityAdded.add(add)
    source.onEntityRemoved.add(remove)
  }
}

export const useSegmentedBucket = <E extends any>(
  source: Bucket<E>,
  size = 50
) => useConst(() => new SegmentedBucket(source, size))
