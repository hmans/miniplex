/* Export everything from the core package. */
export * from "@miniplex/core"

/* Create and export a queue instance */
import { createQueue } from "@hmans/queue"

/**
 * A simple queue (powered by [@hmans/queue](https://github.com/hmans/things/tree/main/packages/hmans-queue))
 * that can be used to schedule work to be done later. This is mostly provided as a convenience
 * to make upgrading from Miniplex 1.0 (which had queuing functionality built-in) a little easier,
 * and it will be deprecated in a future version.
 */
export const queue = createQueue()
