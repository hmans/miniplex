# Changelog

## 2.0.0-beta.3

### Patch Changes

- 80b944f: `useCurrentEntity` will now throw an error if it is invoked outside of an entity context (instead of returning `undefined`).
- 20a0904: Upgraded to building with TypeScript 4.9.
- 728feb4: `<Entity>` now accepts a forwarded ref that will be set to the created entity.
- 48f88f2: Fixed a bug ([#269](https://github.com/hmans/miniplex/issues/269)) where `<Entity>` would destroy and recreate its entity every time it was rendered.
- a96901f: **Breaking Change:** Removed the `<Archetype>` component. Please use `<Entities in={...} />` instead:

  ```jsx
  /* Before: */
  <Archetype with={["enemy", "attacking"]} without="dead" />

  /* After (inline): */
  <Entities in={world.with("enemy", "attacking").without("dead")} />

  /* After (out of band): */
  const attackingEnemies = world.with("enemy", "attacking").without("dead")
  <Entities in={attackingEnemies} />
  ```

## 2.0.0-beta.1

### Patch Changes

- 42134bc: **Hooray, it's the first beta release of Miniplex 2.0!** While the new documentation website is still deeply work in progress, I'd like to provide you with a summary of the changes so you can start giving this thing a go in your projects.

  ### Focus:

  Miniplex 2.0 is a complete rewrite of the library, but while it does bring some breaking changes, it will still allow you to do everything that you've been doing with 1.0. When upgrading a 1.0 project to 2.0, most changes you will need to do are related to things having been renamed.

  The headline changes in 2.0:

  - **A lot more relaxed and lightweight!** Where Miniplex 1.0 would immediately crash your entire application when, for example, adding a component to an entity that already has the component, Miniplex 2.0 will simply no-op and continue.
  - **Much more flexible!** Miniplex 2.0 finally lets you create archetypes of entities that do _not_ have a specific component, and goes even further than that; you can now create _predicate_-based archetypes using any kind of function.
  - **Better type support!** If you're using TypeScript, you will be happy to hear that type support has been significantly improved, with much better narrowed types for created archetypes, and support for both predicates with type guards as well as type generics.
  - The **React API** has been significantly simplified.

  ### Installing:

  Miniplex 2.0 is still in beta, so you will need to install it using the `beta` tag:

  ```bash
  npm add miniplex@beta
  yarn add miniplex@beta
  pnpm add miniplex@beta
  ```

  ### Core:

  - `world.createEntity` has been renamed and simplified to just `world.add` (which now returns the correct type for the entity, too), and `world.destroyEntity` to `world.remove`. `addComponent` and `removeComponent` have not been changed.

    ```js
    const entity = world.add({ position: { x: 0, y: 0 } })
    world.addComponent(entity, { velocity: { x: 0, y: 0 } })
    world.remove(entity)
    ```

  - There is a new `world.update` function that you may use to update an entity and make sure it is reindexed across the various archetypes. It provides a number of different overloads to provide some flexibility in how you update the entity.

    ```js
    world.update(entity, { position: { x: 1, y: 1 } })
    world.update(entity, "position", { x: 1, y: 1 })
    world.update(entity, () => ({ position: { x: 1, y: 1 } }))
    world.update(entity, (e) => (e.position = { x: 1, y: 1 }))
    ```

    Please keep in mind that in Miniplex, you'll typically _mutate_ your entities anyway, so going through this function is not strictly necessary.

  - The `Tag` type and constant have been removed. For tag-like components, simply use `true` (which `Tag` was just an alias for.)
  - Entities added to a world no longer receive a `__miniplex` component. This component has always been an internal implementation detail, but you might have used it in the past to get a unique identifier for an entity. This can now be done through `world.id(entity)`, with ID lookups being available through `world.entity(id)`.
  - Archetypes can now be iterated over directly. Example:

    ```js
    const moving = world.archetype("position", "velocity")

    for (const { position, velocity } of moving) {
      position.x += velocity.x
      position.y += velocity.y
    }
    ```

    You can use this to neatly fetch the first entity from an archetype that you only expect to have a single entity in it:

    ```js
    const [player] = world.archetype("player")
    ```

  - **The queuing functionality that was built into the `World` class has been removed.** If you've relied on this in the past, `miniplex` now exports a `queue` object that you can use instead. Example:

    ```js
    import { queue } from "miniplex"

    queue(() => {
      // Do something
    })

    /* Later */
    queue.flush()
    ```

    Please note that this is being provided to make upgrading to 2.0 a little easier, and will likely be removed in a future version.

  - `world.archetype` can now take a predicate! You can use this as an escape hatch for creating any kind of archetype based on the conditions you specify. Example:

    ```js
    const almostDead = world.archetype((entity) => entity.health < 10)
    ```

    Please note that his requires entities with the `health` component to be updated through the `world.update` function in order to keep the archetype up to date.

  - You can use `with` and `without` as an alternative API for creating archetypes. Example:

    ```js
    const moving = world.with("position", "velocity")
    const alive = world.without("dead")
    ```

  - You can use `where` to create a predicate-based iterator. This allows you to quickly filter a set of entities without creating new archetypes or other objects. Example:

    ```js
    for (const entity of world.where((entity) => entity.health < 10)) {
      // Do something
    }
    ```

  - **All of these can be nested!**

    ```js
    world
      .with("position", "velocity")
      .without("dead")
      .where((entity) => entity.health < 10)
    ```

  - Entities fetched from an archetype will have much improved types, but you can also specify a type to narrow to via these functions' generics:

    ```ts
    const player = world.archetype<Player>("player")
    ```

  - Miniplex provides the new `Strict` and `With` types which you can use to compose types from your entity main type:

    ```ts
    type Entity = {
      position: { x: number; y: number }
      velocity: { x: number; y: number }
    }

    type Player = Strict<With<Entity, "position" | "velocity">>

    const player = world.archetype<Player>("player")
    ```

  ### React:

  - The React package's main import and initialization has been changed:

    ```js
    import { World } from "miniplex"
    import { createReactAPI } from "miniplex/react" // !

    /* It now expects a world as its argument, so you need to create one first: */
    const world = new World()
    const ECS = createReactAPI(world)
    ```

  - The `<Archetype>` component now supports the `with` and `without` properties:

    ```jsx
    <Archetype with={["position", "velocity"]} without="dead">
      {/* ... */}
    </Archetype>
    ```

  - If you already have a reference to an archetype, you can pass it to the newly improved `<Entities>` component to automatically render all entities contained within it, and have them automatically update when the archetype changes:

    ```jsx
    <Entities in={archetype}>{/* ... */}</Entities>
    ```

    If you ever want to list a simple array of entities, you can use the same component (but it will not automatically update if the array contents change):

    ```jsx
    <Entities in={[entity1, entity2]}>{/* ... */}</Entities>
    ```

  - **`<ManagedEntities>` has been removed.** You were probably not using it. If you were, you can replicate the same behavior using a combination of the `<Entities>` or `<Archetype>` components and a `useEffect` hook.
  - The `useEntity` hook has been renamed to `useCurrentEntity`.
  - The world-scoped `useArchetype` hook has been removed, and superceded by the new global `useEntities` hook:

    ```js
    /* Before */
    const entities = useArchetype("position", "velocity")

    /* Now */
    const entities = useEntities(world.with("position", "velocity"))
    ```

  ## Feedback and Questions?

  This is the first beta of a big new release for this library, and since it is a complete rewrite, there are bound to be some bugs and rough edges.

  - Got feedback? Please post it [under this post in the Miniplex Discussions hub](https://github.com/hmans/miniplex/discussions/258)!
  - Found an issue? Please [open an issue](https://github.com/hmans/miniplex/issues)!

- Updated dependencies [42134bc]
  - @miniplex/core@2.0.0-beta.1

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
