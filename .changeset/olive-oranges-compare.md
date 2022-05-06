---
"miniplex": patch
---

**New:** Archetypes now expose a `first` getter that returns the first of the entities in the archetype (or `null` if it doesn't have any entities.) This streamlines situations where you deal with singleton entities (like a player, camera, and so on.) For example, in `miniplex-react`, you can now do the following:

```tsx
export const CameraRigSystem: FC = () => {
  const player = ECS.useArchetype("isPlayer").first
  const camera = ECS.useArchetype("isCamera").first

  /* Do things with player and camera */
}
```
