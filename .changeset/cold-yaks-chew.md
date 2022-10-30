---
"@miniplex/react": patch
---

`<Entities>` has been changed to always take an `in` prop.

```jsx
const bullets = ECS.world.where(archetype("isBullet"))

const Bullets = () => (
  <>
    {/* Query form */}
    <ECS.Entities in={archetype("isBullet")} />

    {/* Bucket form */}
    <ECS.Entities in={bullets} />

    {/* Array form */}
    <ECS.Entities in={bullets.entities.slice(0, 5)} />
  </>
)
```
