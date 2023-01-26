import { Bucket } from "@miniplex/bucket"
import { createQueue } from "@hmans/queue"

export class Monitor<E> {
  protected queue = createQueue()
  protected queueDisconnect = createQueue()

  constructor(
    public readonly bucket: Bucket<E>,
    protected readonly setup: ((entity: E) => void) | undefined = undefined,
    protected readonly teardown: ((entity: E) => void) | undefined = undefined
  ) {
    this.connect()
  }

  connect() {
    /* Setup all existing entities */
    if (this.setup) {
      for (const entity of this.bucket) {
        this.queue(() => this.setup!(entity))
      }

      /* Setup new entities as they are added */
      this.queueDisconnect(
        this.bucket.onEntityAdded.subscribe((entity) => {
          this.queue(() => this.setup!(entity))
        })
      )
    }

    /* Teardown entities as they are removed */
    if (this.teardown) {
      this.queueDisconnect(
        this.bucket.onEntityRemoved.subscribe((entity) => {
          this.queue(() => this.teardown!(entity))
        })
      )
    }

    return this
  }

  disconnect() {
    this.queueDisconnect.flush()
    return this
  }

  run() {
    this.queue.flush()
  }
}
