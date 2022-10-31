---
"@miniplex/core": patch
---

Renamed the `WithComponent<E, P>` helper type to `With<E, P>`. Also added the `Strictly<T>` type that removes all non-required properties from a given type. These can be combined to create a type that is a strict version of a specificy type of entity:

```ts
type Player = With<Entity, "isPlayer" | "transform" | "health">

const players = world.where<Strict<Player>>(archetype("isPlayer"))
```
