---
"miniplex-react": major
---

- The library has been significantly simplified and an almost mind-boggling number of bugs have beens quashed.
- The main import and initialization have changed:

  ```js
  import { World } from "miniplex"
  import createReactAPI from "miniplex-react" // !

  /* It now expects a world as its argument, so you need to create one first: */
  const world = new World()
  const ECS = createReactAPI(world)
  ```

- All lists of entities are now rendered through the upgraded `<Entities>` component, which takes an array of entities or a query (or even a world) as its `in` prop:

  ```jsx
  <Entities in={world.with("asteroid")}>{/* ... */}</Entities>
  ```

  If you're passing in a query or a world, the component will automatically re-render when the entities appear or disappear. If you don't want this, you can also just pass in a plain array containing entities:

  ```jsx
  <Entities in={[entity1, entity2]}>{/* ... */}</Entities>
  ```

- **`<ManagedEntities>` has been removed.** You were probably not using it. If you were, you can replicate the same behavior using a combination of the `<Entities>` component and a `useEffect` hook.
- The `useEntity` hook has been renamed to `useCurrentEntity`.
- The world-scoped `useArchetype` hook has been removed, and superseded by the new global `useEntities` hook:

  ```js
  /* Before */
  const entities = useArchetype("position", "velocity")

  /* Now */
  const entities = useEntities(world.with("position", "velocity"))
  ```
