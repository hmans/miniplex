# Changelog

## 0.6.0 - 2022-03-09

### Breaking Changes

- `world.createArchetype` is now just `world.archetype`. Its signature remains the same.
- React: `useArchetype` (from the React module) now returns the full archetype object (similar to `world.archetype`), and not just its entities.
- React: `createReactIntegration` has been changed to `createECS`. Instead of accepting an existing ECS world as an argument, it will create a world and return it as part of its return value.

### New

- React: The React glue provided by `createECS` now also provides a couple of experimental React components: `<MemoizedEntity>`, `<Entities>` and `<Collection>`. Documentation will follow once these stabilize.
- React: The `<Component>` React component will now optionally accept a single React child whose ref will be assigned to the component's data.
