---
"miniplex": patch
"@miniplex/bucket": patch
"@miniplex/core": patch
"@miniplex/react": patch
---

**Aaaaah, it's Miniplex 2.0 Beta 4!** The library received some major refactoring for this beta, making it significantly less complex, and at the same time easier to explain. Which, sadly, also means **breaking changes** -- but most of them are just renames, so you shouldn't have any trouble upgrading. (If you do, let me know!)

The most important changes:

- `world.archetype` is gone. The query API is now just `.with(...components)` and `.without(...components)`.
- Like before, these can be chained indefinitely. Miniplex no longer uses a tree structure for queries, and will always return the same query objects for the same set of query parameters. (This paves the way for some potential optimizations in the future that can now be implemented without breaking changes.)
- `.where(predicate)` now returns a full query object that can be chained further. Please note that this functionality is still _experimental_ and may change in the future.
- The documentation is moving away from the "archetype" terminology, and is now using "query" instead, but conceptually, they are pretty much the same thing, so don't let this scare you if you're coming from 1.0.
