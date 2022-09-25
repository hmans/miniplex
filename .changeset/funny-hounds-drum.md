---
"miniplex": minor
---

**Major Breaking Change:** The signature of `addComponent` has been simplified to accept an entity, a component name, and the value of the component:

```ts
/* Before */
world.addComponent(entity, { position: { x: 0, y: 0 } })

/* After */
world.addComponent(entity, "position", { x: 0, y: 0 })
```

The previous API for `addComponent` is now available as `extendEntity`, but _marked as deprecated_.
