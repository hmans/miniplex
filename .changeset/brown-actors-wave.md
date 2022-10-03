---
"miniplex-react": patch
---

**New:** `<ArchetypeEntities>`, a new component that (reactively) renders all entities of the specified archetype. This can be used as a replacement for the combination of `useArchetypes` and `<Entities>`, except now your component won't re-render when entities appear or disappear, because the subscription will be scoped to `<ArchetypeEntities>`.
