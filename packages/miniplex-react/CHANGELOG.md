# Changelog

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
