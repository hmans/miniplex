import { Bucket } from "./Bucket"
import { createQueue } from "@hmans/queue"

export class Monitor<E> {
  protected queue = createQueue()
  protected queueDisconnect = createQueue()

  constructor(public readonly bucket: Bucket<E>) {}

  setup(setup: (entity: E) => void) {
    for (const entity of this.bucket) {
      this.queue(() => setup(entity))
    }

    /* Setup new entities as they are added */
    this.queueDisconnect(
      this.bucket.onEntityAdded.subscribe((entity) => {
        this.queue(() => setup(entity))
      })
    )

    return this
  }

  teardown(teardown: (entity: E) => void) {
    this.queueDisconnect(
      this.bucket.onEntityRemoved.subscribe((entity) => {
        this.queue(() => teardown(entity))
      })
    )

    return this
  }

  stop() {
    this.queueDisconnect.flush()
    return this
  }

  run() {
    this.queue.flush()
  }
}
