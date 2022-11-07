---
"@miniplex/core": patch
---

Added an `update` function to the `World` class that allows the user to update an entity. This is intended to complement the other two mutating functions (`addComponent`, `removeComponent`), simply to allow for the use of syntactic sugar (component constructor functions, entity factories, etc.) in a streamlined fashion:

```js
/* With an object with changes */
world.update(entity, { age: entity.age + 1 })

/* With a function returning an object with changes */
const increaseAge = ({age}) => ({ age: age + 1 }
world.update(entity, increaseAge)

/* With a function that mutates the entity directly: */
const mutatingIncreaseAge = (entity) => entity.age++
world.update(entity, mutatingIncreaseAge)
```

The main job of the function is to re-index the updated entity against known derived buckets, and since in Miniplex you'll typically mutate entities directly, it can even be called with _only_ an entity. All of the above are essentially equivalent to:

```js
entity.age++
world.update(entity)
```
