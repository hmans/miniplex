---
"miniplex": major
---

**Major Breaking Change:** The signature of `addComponent` has been simplified to accept an entity, a component name, and the value of the component:

```ts
/* Before */
world.addComponent(entity, { position: { x: 0, y: 0 } })

/* After */
world.addComponent(entity, "position", { x: 0, y: 0 })
```

The previous API for `addComponent` is now available as `extendEntity`, with the caveat that it now only accepts two arguments, the entity and the component object:

```ts
world.extendEntity(entity, {
  position: { x: 0, y: 0 },
  velocity: { x: 10, y: 20 }
})
```
