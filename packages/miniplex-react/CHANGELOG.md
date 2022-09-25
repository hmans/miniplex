# Changelog

## 0.4.2

### Patch Changes

- 1b2976c: Fixed return type of `useArchetype`.

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
