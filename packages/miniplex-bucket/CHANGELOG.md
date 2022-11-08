# @miniplex/bucket

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
