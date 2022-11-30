---
"@miniplex/react": patch
---

`useCurrentEntity` will now throw an error if it is invoked outside of an entity context (instead of returning `undefined`).
