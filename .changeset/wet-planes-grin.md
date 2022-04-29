---
"miniplex": patch
---

The internal IDs that are being generated for entities have been changed slightly, as they now start at `0` (instead of `1`) and are always equal to the position of the entity within the world's `entities` array. The behavior of `destroyEntity` has also been changed to `null` the destroyed entity's entry in that array, instead of cutting the entity from it.

This change allows you to confidently and reliably use the entity ID (found in the internal miniplex component, `entity.__miniplex.id`) when integrating with non-miniplex systems, including storing data in TypedArrays (for which miniplex may gain built-in support at some point in the future; this change is also in preparation for that.)
