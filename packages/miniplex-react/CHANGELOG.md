# Changelog

## 2.0.0-next.1

### Patch Changes

- 41ccab7: <Property> now reactively changes a property's value without removing and re-adding the property.
- 86c2fdb: Added `useArchetype`.
- 40cf138: Removed `useBucket`, it didn't do anything useful. Just use `useEntities`.

## 2.0.0-next.0

### Major Changes

- f2406db: 2.0!

### Patch Changes

- Updated dependencies [f2406db]
  - miniplex@2.0.0-next.0

## 1.0.1

### Patch Changes

- a43c734: **Fixed:** When `<Component>` re-renders, it is expected to reactively update the component's data to the value of its `data` prop, or the `ref` of its React child. It has so far been doing that by removing and re-adding the entire component, which had the side-effect of making the entity disappear from and then reappear in archetypes indexing that component. This has now been fixed.

  The component will only be added and removed once (at the beginning and the end of the React component's lifetime, respectively); in re-renders during its lifetime, the data will simply be updated directly when a change is detected. This allows you to connect a `<Component>` to the usual reactive mechanisms in React.

## 1.0.0

### Major Changes

- ce9cfb4: **Breaking Change:** The `useEntity` hook has been renamed to `useCurrentEntity` to better express what it does, and to make way for future `useEntity` and `useEntities` hooks that will create and destroy entities.

### Patch Changes

- c102f2d: **New:** `<ArchetypeEntities>`, a new component that (reactively) renders all entities of the specified archetype. This can be used as a replacement for the combination of `useArchetype` and `<Entities>`, except now your component won't re-render when entities appear or disappear, because the subscription will be scoped to `<ArchetypeEntities>`.

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
    return <ArchetypeEntities archetype="my-archetype" />
  }
  ```

  The component will also accept arrays of component names:

  ```tsx
  const EnemyShips = () => {
    return <ArchetypeEntities archetype={["ship", "enemy"]} />
  }
  ```

- c38d7e5: **Fixed:** A couple of components were using `useEffect` where it should have been `useLayoutEffect`.
- 54bb5ef: **Fixed:** <Entity> no longer re-renders once after mounting.
- 551dcd9: **New:** The `createECS` function now allows you to pass in an existing `World` instance as its first argument. If no world is passed, it will create a new one (using the specified type, if any), as it has previously.

## 1.0.0-next.8

### Patch Changes

- 877dac5: **Fixed:** Make use of `useIsomorphicLayoutEffect`.

## 1.0.0-next.7

### Patch Changes

- c38d7e5: **Fixed:** A couple of components were using `useEffect` where it should have been `useLayoutEffect`.
- 54bb5ef: **Fixed:** <Entity> no longer re-renders once after mounting.

## 1.0.0-next.6

### Patch Changes

- efa21f2: Typing tweaks.

## 1.0.0-next.4

### Patch Changes

- c102f2d: **New:** `<ArchetypeEntities>`, a new component that (reactively) renders all entities of the specified archetype.

## 1.0.0-next.3

### Patch Changes

- 1950b9b: General cleanup and typing improvements.

## 1.0.0-next.2

### Patch Changes

- 551dcd9: The `createECS` function now allows you to pass in an existing `World` instance as its first argument. If no world is passed, it will create a new one (using the specified type, if any), as it has previously.

## 1.0.0-next.1

### Major Changes

- 4016fb2: 1.0!

### Patch Changes

- Updated dependencies [410e0f6]
- Updated dependencies [4016fb2]
  - miniplex@1.0.0-next.1

## 0.4.3-next.0

### Patch Changes

- dd047e9: This package now loads `miniplex` as a direct dependency; it is no longer necessary to install miniplex as a peer dependency.
- Updated dependencies [769dba7]
- Updated dependencies [b8b2c9b]
- Updated dependencies [cb6d078]
- Updated dependencies [4d9e51b]
  - miniplex@0.11.0-next.0

## 0.4.2

### Patch Changes

- 1422853: Fixed return type of `useArchetype`.

## 0.4.1

### Patch Changes

- cb09f35: **Fixed:** When you're passing a complete React element (through JSX) to a `<Component>`, you were not able to set a `ref` on it. This has now been fixed.

## 0.4.0

### Minor Changes

- 0f01a94: **Breaking Change:** `<Collection>` has been renamed to `<ManagedEntities>`.
- 0ad0e86: **Breaking Change:** `useEntity` has been changed back to its original functionality of returning the current entity context. `useEntities` has been removed.

## 0.3.1

### Patch Changes

- db987cd: Improve typings within `useEntities`.

## 0.3.0

### Minor Changes

- cc4032d: **New:** `useEntities` is a new hook that will create and return a specified number of entities, initialized through an optional entity factory. `useEntity` does the same, but just for a single entity.

## 0.2.4

### Patch Changes

- 68cff32: Fix React 18 Strict Mode compatibility in `<Component>`.

## 0.2.3

### Patch Changes

- c23681c: More tweaks to the sanity checks

## 0.2.2

### Patch Changes

- 48e785d: Fix sanity check in `<Component>`

## 0.2.1

### Patch Changes

- 0c1ce64: Now uses `useEffect` instead of `useLayoutEffect`, which should make it easier to use the components in server-side React.

## 0.2.0

### Minor Changes

- b4fa0b4: `<Component>` and `<Collection>` now use the new `addComponent` API introduced with miniplex 0.8.0.

### Patch Changes

- Updated dependencies [011c384]
  - miniplex@0.8.1

## 0.1.0

- First release
