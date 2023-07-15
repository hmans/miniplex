---
"miniplex": major
---

Miniplex 2.0 is a complete rewrite of the library, with a heavy focus on further improving the developer experience, and squashing some significant bugs.

While it does bring some breaking changes, it will still allow you to do everything that you've been doing with 1.0; when upgrading a 1.0 project to 2.0, most changes you will need to do are related to things having been renamed.

The headline changes in 2.0:

- **A lot more relaxed and lightweight!** Where Miniplex 1.0 would immediately crash your entire application when, for example, adding a component to an entity that already has the component, Miniplex 2.0 will simply no-op and continue.
- **Much more flexible!** Miniplex 2.0 simplifies and extends the query API (formerly often referred to as "archetypes"); you can now create queries through `world.with("componentName")`, chain these together, use the new `without`, or even create advanced predicate-based queries using `where`.
- **Improved type support!** If you're using TypeScript, you will be happy to hear that type support has been significantly improved, with much better type narrowing for queries.
- The **React API** has been significantly simplified, and some pretty big bugs have been squashed. (Turns out Miniplex 1.0's React API really didn't like React's `<StrictMode>`` much. Whoops!)

Some more details on the changes:

- `world.createEntity` has been renamed and simplified to just `world.add` (which now returns the correct type for the entity, too), and `world.destroyEntity` to `world.remove`.

  ```js
  const entity = world.add({ position: { x: 0, y: 0 } })
  world.addComponent(entity, "velocity", { x: 0, y: 0 })
  world.remove(entity)
  ```

- The `Tag` type and constant have been removed. For tag-like components, simply use `true` (which `Tag` was just an alias for.)
- Entities added to a world no longer receive a `__miniplex` component. This component has always been an internal implementation detail, but you might have used it in the past to get a unique identifier for an entity. This can now be done through `world.id(entity)`, with ID lookups being available through `world.entity(id)`.
- Queries can now be iterated over directly. Example:

  ```js
  const moving = world.with("position", "velocity")

  for (const { position, velocity } of moving) {
    position.x += velocity.x
    position.y += velocity.y
  }
  ```

  This is, in fact, now the recommended way to iterate over entities, since it is extremely efficient, _and_ will make sure that the list of entities is being iterated over _in reverse_, which makes it safe to modify it during iteration.

  You can also use this to neatly fetch the first entity from an archetype that you only expect to have a single entity in it:

  ```js
  const [player] = world.with("player")
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

- `with` and `without` are the new API for building queries. Examples:

  ```js
  const moving = world.with("position", "velocity")
  const alive = world.without("dead")
  ```

- The new `world.where` now allows you to build predicate-based queries! You can use this as an escape hatch for creating any kind of query based on any conditions you specify. Example:

  ```js
  const almostDead = world.where((entity) => entity.health < 10)
  ```

  Please note that his requires entities with the `health` component to be reindexed using the `world.reindex` function in order to keep the archetype up to date. Please refer to the documentation for more details.

- You can use `where` to create a predicate-based iterator. This allows you to quickly filter a set of entities without creating new archetypes or other objects. Example:

  ```js
  for (const entity of world.where((entity) => entity.health < 10)) {
    // Do something
  }
  ```

- **All of these can be chained!**

  ```js
  world
    .with("position", "velocity")
    .without("dead")
    .where((entity) => entity.health < 10)
  ```

- Entities fetched from a query will have much improved types, but you can also specify a type to narrow to via these functions' generics:

  ```ts
  const player = world.with<Player>("player")
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

- The event library Miniplex uses has been changed to [Eventery](https://github.com/hmans/eventery), which brings a change in API. Where before you would have done `onEntityAdded.add(listener)`, you will now to `onEntityAdded.subscribe(listener)`.
