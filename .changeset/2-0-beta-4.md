---
"miniplex": patch
---

**Aaaaah, it's Miniplex 2.0 Beta 4!** The library received some major refactoring for this beta, making it significantly less complex, and at the same time easier to explain and document. Which, sadly, also means **breaking changes** -- but most of them are just renames, so you shouldn't have any trouble upgrading. (If you do, let me know!)

The most important changes:

- `world.archetype` is gone. The query API is now just `.with(...components)` and `.without(...components)`.
- Like in the previous beta, these can be chained indefinitely, but there are some changes to how this is implemented. Most importantly, it does away with the concept of "a waterfall of buckets", which had proven difficult to explain and a source of many wonderful footguns.
- `.where(predicate)` now returns a full query object that can be chained further (as opposed to a standalone iterator). Please note that this functionality is still _experimental_ and will still receive upgrades and changes in the future.
- The event library Miniplex uses has been changed to [Eventery](https://github.com/hmans/eventery), which brings a change in API. Where before you would have done `onEntityAdded.add(listener)`, you will now to `onEntityAdded.subscribe(listener)`.
- The documentation is moving away from the "archetype" terminology, and is now using "query" instead. If you're coming from 1.0 where everything went through "archetypes", don't worry, they're both conceptually the same thing.
