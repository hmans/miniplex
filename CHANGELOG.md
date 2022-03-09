# Changelog

## 0.6.0 - unreleased

### Breaking Changes

- `world.createArchetype` is now just `world.archetype`. Its signature remains the same.
- `useArchetype` (from the React module) now returns the full archetype object (similar to `world.archetype`), and not just its entities.
- `createReactIntegration` has been changed to `createECS`. Instead of accepting an existing ECS world as an argument, it will create a world and return it as part of its return value.

### New

- The React glue provided by `createECS` now also provides a couple of experimental React components: `<MemoizedEntity>`, `<Entities>` and `<Collection>`. Documentation will follow once these stabilize.
