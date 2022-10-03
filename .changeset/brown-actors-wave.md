---
"miniplex-react": patch
---

**New:** `<ArchetypeEntities>`, a new component that (reactively) renders all entities of the specified archetype. This can be used as a replacement for the combination of `useArchetype` and `<Entities>`, except now your component won't re-render when entities appear or disappear, because the subscription will be scoped to `<ArchetypeEntities>`.

Where before you may have done this:

```tsx
const MyComponent = () => {
  const { entities } = useArchetype("my-archetype")
  /* This component will now re-render every time the archetype is updated */
  return <Entities entities={entities} />
}
```

You can now do this:

```tsx
const MyComponent = () => {
  /* This component will not rerender */
  return <ArchetypeEntities archetype={["my-archetype"]} />
}
```
