---
"@miniplex/core": patch
---

Added `.with(...components)` and `.without(...components)` functions to all entity buckets.

```js
/* Equivalent */
world.with("foo")
world.archetype("foo")

/* Equivalent */
world.without("foo")
world.archetype({ without: ["foo"] })
```
