# Changelog

## 0.8.0

- **Breaking Change:** the `QueriedEntity` type has been replaced with the simpler `EntityWith` type.
- **Breaking Change:** all the React glue has been moved to the new `miniplex-react` package.

## 0.7.1

- **Change:** Miniplex now uses preconstruct for building ESM and CSJ bundles of the library.

## 0.7.0

- **Breaking Change:** Removed the (experimental) complex query syntax for the time being to simplify things. Will re-add a better implementation once the need for it is actually proven.

- **New:** Entities returned by archetypes are now properly typed to represent the required presence of the queried components. (Example: if your archetype contains the `velocity` component, the entities retrieved through `archetype.entities` will be typed to always have `velocity` present, because otherwise they wouldn't be part of this archetype.)

## 0.6.0 - 2022-03-09

- **Breaking Change:** `world.createArchetype` is now just `world.archetype`. Its signature remains the same.
- **Breaking Change:** `useArchetype` (from the React module) now returns the full archetype object (similar to `world.archetype`), and not just its entities.
- **Breaking Change:** `createReactIntegration` has been changed to `createECS`. Instead of accepting an existing ECS world as an argument, it will create a world and return it as part of its return value.

- **New:** React: The React glue provided by `createECS` now also provides a couple of experimental React components: `<MemoizedEntity>`, `<Entities>` and `<Collection>`. Documentation will follow once these stabilize.
- **New:** React: The `<Component>` React component will now optionally accept a single React child whose ref will be assigned to the component's data.
