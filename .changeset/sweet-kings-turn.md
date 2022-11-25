---
"@miniplex/react": patch
---

**Breaking Change:** Removed the `<Archetype>` component. Please use `<Entities in={...} />` instead:

```jsx
/* Before: */
<Archetype with={["enemy", "alive"]} />

/* After: */
<Entities in={world.with("enemy", "alive")} />
```
