---
"miniplex": minor
---

**Typescript:** You no longer need to mix in `IEntity` into your own entity types, as part of a wider refactoring of the library's typings. Also, `createWorld` will now return a `RegisteredEntity<YourEntity>` type that reflects the presence of the automatically added internal `__miniplex` component, and makes a lot of interactions with the world instance safer than it was previously.
