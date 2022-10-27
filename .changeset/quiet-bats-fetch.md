---
"@miniplex/react": patch
---

`<Archetype>` has been changed to match the new query capabilities of the core library's `world.archetype` function. All of these are now valid:

```tsx
<Archetype query="position" />
<Archetype query={["position", "velocity"]} />
<Archetype query={{ all: ["position", "velocity"], none: ["dead"] }} />
```
