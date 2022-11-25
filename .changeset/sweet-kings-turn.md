---
"@miniplex/react": patch
---

**Breaking Change:** Removed the `<Archetype>` component. Please use `<Entities in={...} />` instead:

```jsx
/* Before: */
<Archetype with={["enemy", "attacking"]} without="dead" />

/* After (inline): */
<Entities in={world.with("enemy", "attacking").without("dead")} />

/* After (out of band): */
const attackingEnemies = world.with("enemy", "attacking").without("dead")
<Entities in={attackingEnemies} />
```
