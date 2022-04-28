---
"miniplex": minor
---

**Breaking Change:** `createEntity` will now, like in earlier versions of this library, mutate the first argument that is passed into it (and return it). This allows for patterns where you create the actual entity _object_ before you actually convert it into an entity through _createEntity_.
