---
"miniplex": major
---

**Breaking Change:** The `Archetype.first` getter has been removed in the interest of reducing API surface where things can also be expressed using common JavaScript constructs:

```jsx
/* Before: */
const player = world.archetype("player").first

/* Now: */
const [player] = world.archetype("player")
```
