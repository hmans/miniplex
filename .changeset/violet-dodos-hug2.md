---
"miniplex": minor
---

**Breaking Change:** Miniplex will no longer automatically add an `id` component to created entities. If your project has been making use of these automatically generated IDs, you will now need to add them yourself.

Example:

```js
let nextId = 0

/* Some component factories */
const id = () => ({ id: nextId++ })
const name = (name) => ({ name })

const world = new World()
const entity = world.createEntity(id(), name("Alice"))
```

**Note:** Keep in mind that Miniplex doesn't care about entity IDs much, since all interactions with the world are done through object references. Your project may not need to add IDs to entities at all; if it does, this can now be done using any schema that your project requires (numerical IDs, UUIDs, ...).
