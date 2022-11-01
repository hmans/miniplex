---
"@miniplex/core": patch
---

**Breaking Change:** The friendlier, cozier 1.0 API is back. You now create archetypes once again through `world.archetype`:

```js
/* Component name form */
world.archetype("name")
world.archetype("name", "age")

/* Query form (allows for without checks) */
world.archetype({ with: ["age"], without: ["height"] })
```

These can now be nested:

```js
world.archetype("name").archetype("age")
```

`archetype` also takes a function predicate:

```js
world.archetype("age").archetype((e) => e.age > 18)
```

> **Warning** This will only be evaluated whenever the entity is added to the archetype from its source, and every time components are added to or removed from it, but not when any of the actual component values change.

**`where` produces a short-lived iterator** that allows a system to only operate on a subset of entities, without creating a new archetype, which in some situations will be much more efficient than creating value-based archetypes and keeping them updated:

```js
const withAge = world.archetype("age")

for (const entity of withAge.where((e) => e.age > 18)) {
  /* Do something with entity */
}
```
