---
"miniplex": minor
---

**Breaking Change:** When destroying entities, they are now removed from the world's global list of entities as well as the archetypes' lists of entities using the shuffle-and-pop pattern. This has the following side-effects that _may_ impact your code:

- Entities are no longer guaranteed to stay in the same order.
- The entity ID storied in its internal `__miniplex` component no longer corresponds to its index in the `entities` array.

This change provides significantly improved performance in situations where a large number of entities are continuously being created and destroyed.
