import { Bucket } from "./Bucket"
import { createQueue } from "@hmans/queue"

export class Monitor<E> {
  get isImmediate() {
    return this._isImmediate
  }

  protected _isImmediate = false
  protected _queue = createQueue()
  protected _queueDisconnect = createQueue()

  constructor(public readonly bucket: Bucket<E>) {}

  onAdd(setup: (entity: E) => void) {
    for (const entity of this.bucket) {
      this.queue(() => setup(entity))
    }

    /* Setup new entities as they are added */
    this._queueDisconnect(
      this.bucket.onEntityAdded.subscribe((entity) => {
        this.queue(() => setup(entity))
      })
    )

    return this
  }

  onRemove(teardown: (entity: E) => void) {
    this._queueDisconnect(
      this.bucket.onEntityRemoved.subscribe((entity) => {
        this.queue(() => teardown(entity))
      })
    )

    return this
  }

  stop() {
    this._queueDisconnect.flush()
    return this
  }

  run() {
    this._queue.flush()
    return this
  }

  immediate(enable = true) {
    this._isImmediate = enable
    return this
  }

  protected queue(fn: () => void) {
    if (this.isImmediate) fn()
    else this._queue(fn)
  }
}
