---
"miniplex": patch
---

**Added:** Archtypes now implement a `[Symbol.iterator]`, meaning they can be iterated over directly:

```js
const withVelocity = world.archetype("velocity")

for (const { velocity } of withVelocity) {
  /* ... */
}
```

(Thanks @benwest.)
