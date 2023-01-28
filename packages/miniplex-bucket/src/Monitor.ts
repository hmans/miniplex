import { Bucket } from "./Bucket"
import { createQueue } from "@hmans/queue"

export class Monitor<E> {
  get isAutomatic() {
    return this._isAutomatic
  }

  get isManual() {
    return !this._isAutomatic
  }

  protected _isAutomatic = true
  protected _queue = createQueue()
  protected _queueDisconnect = createQueue()

  constructor(public readonly bucket: Bucket<E>) {}

  onAdd(setup: (entity: E) => void) {
    for (const entity of this.bucket) {
      this.perform(() => setup(entity))
    }

    /* Setup new entities as they are added */
    this._queueDisconnect(
      this.bucket.onEntityAdded.subscribe((entity) => {
        this.perform(() => setup(entity))
      })
    )

    return this
  }

  onRemove(teardown: (entity: E) => void) {
    this._queueDisconnect(
      this.bucket.onEntityRemoved.subscribe((entity) => {
        this.perform(() => teardown(entity))
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

  manual() {
    this._isAutomatic = false
    return this
  }

  automatic() {
    this._isAutomatic = true
    return this
  }

  protected perform(fn: () => void) {
    if (this.isAutomatic) fn()
    else this._queue(fn)
  }
}
