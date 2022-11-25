---
"@miniplex/react": patch
---

**Breaking Change:** Removed the `<Archetype>` component. Please use `<Entities in={...} />` instead:

```jsx
/* Before: */
<Archetype with={["enemy", "attacking"]} without="dead" />

/* After: */
const attackingEnemies = world.with("enemy", "attacking").without("dead")
<Entities in={attackingEnemies} />
```
