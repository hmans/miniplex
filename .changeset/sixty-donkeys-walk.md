---
"miniplex-react": patch
---

**Fixed:** When `<Component>` re-renders, it is expected to update the component's data to the value of its `data` prop, or the `ref` of its React child. It has so far been doing that by removing and re-adding the entire component, which had the side-effect of making the entity disappear from and then reappear in archetypes indexing that component. This has now been fixed; the component will only be added and removed once (at the beginning and the end of the React component's lifetime, respectively); in re-renders during its lifetime, the data will simply be updated directly when a change is detected. This allows you to connect a `<Component>` to the usual reactive mechanisms in React.
