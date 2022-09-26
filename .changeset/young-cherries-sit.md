---
"miniplex-react": patch
---

The `createECS` function now allows you to pass in an existing `World` instance as its first argument. If no world is passed, it will create a new one (using the specified type, if any), as it has previously.
