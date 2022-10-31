---
"miniplex": patch
---

Now exporting `queue`, a simple queueing mechanism that is being provided for convenience, and to make upgrading from Miniplex 1.0 (which provided its own
queueing mechanism) a little easier.

```js
import { queue } from "miniplex"

/* Queue some work */
queue(() => console.log("Hello, world!"))

/* Call flush to execute all queued work */
queue.flush()
```

> **Note** `queue` will likely be marked as deprecated in a future version, and eventually removed. It's simply an instance of a queue provided by the [@hmans/queue](https://www.npmjs.com/package/@hmans/queue) package, which you can also just use directly.
