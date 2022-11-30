# miniplex

## 2.0.0-beta.3

### Patch Changes

- 20a0904: Upgraded to building with TypeScript 4.9.
- Updated dependencies [80b944f]
- Updated dependencies [20a0904]
- Updated dependencies [728feb4]
- Updated dependencies [48f88f2]
- Updated dependencies [a96901f]
  - @miniplex/react@2.0.0-beta.3
  - @miniplex/core@2.0.0-beta.3

## 2.0.0-beta.2

### Patch Changes

- @miniplex/core@2.0.0-beta.2

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
  - @miniplex/react@2.0.0-beta.1

## 1.0.0

### Major Changes

- 769dba7: **Major Breaking Change:** The signature of `addComponent` has been simplified to accept an entity, a component name, and the value of the component:

  ```ts
  /* Before */
  world.addComponent(entity, { position: { x: 0, y: 0 } })

  /* After */
  world.addComponent(entity, "position", { x: 0, y: 0 })
  ```

  The previous API for `addComponent` is now available as `extendEntity`, with the caveat that it now only accepts two arguments, the entity and the component object:

  ```ts
  world.extendEntity(entity, {
    position: { x: 0, y: 0 },
    velocity: { x: 10, y: 20 }
  })
  ```

- b8b2c9b: **Major Breaking Change:** The API signature of `createEntity` has been simplified in order to improve clarity of the API and reduce complexity in both implementation and types. `createEntity` now only supports a single argument, which _must_ satisfy the world's entity type.

  This will only affect you if you have been using `createEntity` with more than one argument in order to compose entities from partial entities, like so:

  ```js
  const entity = createEntity(position(0, 0), velocity(1, 1), health(100))
  ```

  This always had the issue of `createEntity` not checking the initial state of the entity against the world's entity type. Theoretically, the library could invest some additional effort into complex type assembly to ensure that the entity is valid, but there are enough object composition tools available already, so it felt like an unneccessary duplication.

  Instead, composition is now deferred into userland, where one of the most simple tools is the spread operator:

  ```js
  const entity = createEntity({
    ...position(0, 0),
    ...velocity(1, 1),
    ...health(100)
  })
  ```

- 54c59c8: **Breaking Change:** The `Archetype.first` getter has been removed in the interest of reducing API surface where things can also be expressed using common JavaScript constructs:

  ```jsx
  /* Before: */
  const player = world.archetype("player").first

  /* Now: */
  const [player] = world.archetype("player")
  ```

- cb6d078: **Breaking Change:** When destroying entities, they are now removed from the world's global list of entities as well as the archetypes' lists of entities using the shuffle-and-pop pattern. This has the following side-effects that _may_ impact your code:

  - Entities are no longer guaranteed to stay in the same order.
  - The entity ID storied in its internal `__miniplex` component no longer corresponds to its index in the `entities` array.

  This change provides significantly improved performance in situations where a large number of entities are continuously being created and destroyed.

- 4d9e51b: **Breaking Change:** Removed the `EntityID` and `ComponentData` types.
- c08f39a: **Breaking Change:** The `ComponentName<T>` type has been removed in favor of just using `keyof T`.

### Patch Changes

- 410e0f6: **New:** The `World` class can now be instantiated with an initial list of entities like so:

  ```js
  const world = new World({ entities: [entity1, entity2] })
  ```

- c12dfc1: **Fixed:** `createEntity` was not checking against the world's entity type; this has been fixed.

## 1.0.0-next.6

### Patch Changes

- efa21f2: Typing tweaks.

## 1.0.0-next.5

### Patch Changes

- c12dfc1: **Fixed:** Improved typing of `createEntity`.

## 1.0.0-next.1

### Major Changes

- 4016fb2: 1.0!

### Patch Changes

- 410e0f6: The `World` class can now be instantiated with an initial list of entities like so:

  ```js
  const world = new World({ entities: [entity1, entity2] })
  ```

## 0.11.0-next.0

### Minor Changes

- 769dba7: **Major Breaking Change:** The signature of `addComponent` has been simplified to accept an entity, a component name, and the value of the component:

  ```ts
  /* Before */
  world.addComponent(entity, { position: { x: 0, y: 0 } })

  /* After */
  world.addComponent(entity, "position", { x: 0, y: 0 })
  ```

  The previous API for `addComponent` is now available as `extendEntity`, but _marked as deprecated_.

- b8b2c9b: **Breaking Change:** The API signature of `createEntity` has been simplified in order to improve clarity of the API and reduce complexity in both implementation and types. `createEntity` now only supports a single argument, which _must_ satisfy the world's entity type.

  This will only affect you if you have been using `createEntity` with more than one argument in order to compose entities from partial entities, like so:

  ```js
  const entity = createEntity(position(0, 0), velocity(1, 1), health(100))
  ```

  This always had the issue of `createEntity` not checking the initial state of the entity against the world's entity type. Theoretically, the library could invest some additional effort into complex type assembly to ensure that the entity is valid, but there are enough object composition tools available already, so it felt like an unneccessary duplication.

  Instead, composition is now deferred into userland, where one of the most simple tools is the spread operator:

  ```js
  const entity = createEntity({
    ...position(0, 0),
    ...velocity(1, 1),
    ...health(100)
  })
  ```

- cb6d078: **Breaking Change:** When destroying entities, they are now removed from the world's global list of entities as well as the archetypes' lists of entities using the shuffle-and-pop pattern. This has the following side-effects that _may_ impact your code:

  - Entities are no longer guaranteed to stay in the same order.
  - The entity ID storied in its internal `__miniplex` component no longer corresponds to its index in the `entities` array.

  This change provides significantly improved performance in situations where a large number of entities are continuously being created and destroyed.

- 4d9e51b: **Breaking Change:** Removed the `EntityID` and `ComponentData` types.

## 0.10.5

### Patch Changes

- 5ef5f95: Included RegisteredEntity in ArchetypeEntity. (@benwest)
- c680bdd: Narrowed return type for createEntity (with one argument). (@benwest)

## 0.10.4

### Patch Changes

- 74e34c7: **Fixed:** Fixed an issue with the new iterator syntax on archetypes. (@benwest)

## 0.10.3

### Patch Changes

- 1cee12c: Typing improvements, thanks to @benwest.
- 65d2b77: **Added:** Archtypes now implement a `[Symbol.iterator]`, meaning they can be iterated over directly:

  ```js
  const withVelocity = world.archetype("velocity")

  for (const { velocity } of withVelocity) {
    /* ... */
  }
  ```

  (Thanks @benwest.)

## 0.10.2

### Patch Changes

- 821a45c: **Fixed:** When the world is cleared, archetypes now also get their entities lists cleared.

## 0.10.1

### Patch Changes

- cca39cd: **New:** Archetypes now expose a `first` getter that returns the first of the entities in the archetype (or `null` if it doesn't have any entities.) This streamlines situations where you deal with singleton entities (like a player, camera, and so on.) For example, in `miniplex-react`, you can now do the following:

  ```tsx
  export const CameraRigSystem: FC = () => {
    const player = ECS.useArchetype("isPlayer").first
    const camera = ECS.useArchetype("isCamera").first

    /* Do things with player and camera */
  }
  ```

## 0.10.0

### Minor Changes

- cc4032d: **Breaking Change:** `createEntity` will now, like in earlier versions of this library, mutate the first argument that is passed into it (and return it). This allows for patterns where you create the actual entity _object_ before you actually convert it into an entity through _createEntity_.

### Patch Changes

- b93a831: The internal IDs that are being generated for entities have been changed slightly, as they now start at `0` (instead of `1`) and are always equal to the position of the entity within the world's `entities` array. The behavior of `destroyEntity` has also been changed to `null` the destroyed entity's entry in that array, instead of cutting the entity from it.

  This change allows you to confidently and reliably use the entity ID (found in the internal miniplex component, `entity.__miniplex.id`) when integrating with non-miniplex systems, including storing data in TypedArrays (for which miniplex may gain built-in support at some point in the future; this change is also in preparation for that.)

## 0.9.2

### Patch Changes

- 92cf103: Safer sanity check in `addComponent`

## 0.9.1

### Patch Changes

- 48e785d: Fix sanity check in `removeComponent`

## 0.9.0

### Minor Changes

- b4cee80: **Breaking Change:** `createEntity` will now always return a new object, and not return the one passed to it.
- 544f231: **Typescript:** You no longer need to mix in `IEntity` into your own entity types, as part of a wider refactoring of the library's typings. Also, `createWorld` will now return a `RegisteredEntity<YourEntity>` type that reflects the presence of the automatically added internal `__miniplex` component, and makes a lot of interactions with the world instance safer than it was previously.
- 544f231: **Breaking Change:** Miniplex will no longer automatically add an `id` component to created entities. If your project has been making use of these automatically generated IDs, you will now need to add them yourself.

  Example:

  ```js
  let nextId = 0

  /* Some component factories */
  const id = () => ({ id: nextId++ })
  const name = (name) => ({ name })

  const world = new World()
  const entity = world.createEntity(id(), name("Alice"))
  ```

  **Note:** Keep in mind that Miniplex doesn't care about entity IDs much, since all interactions with the world are done through object references. Your project may not need to add IDs to entities at all; if it does, this can now be done using any schema that your project requires (numerical IDs, UUIDs, ...).

### Patch Changes

- b4cee80: `createEntity` now allows you to pass multiple parameters, each representing a partial entity. This makes the use of component factory functions more convenient. Example:

  ```js
  /* Provide a bunch of component factories */
  const position = (x = 0, y = 0) => ({ position: { x, y } })
  const velocity = (x = 0, y = 0) => ({ velocity: { x, y } })
  const health = (initial) => ({
    health: { max: initial, current: initial }
  })

  const world = new World()

  const entity = world.createEntity(
    position(0, 0),
    velocity(5, 7),
    health(1000)
  )
  ```

  **Typescript Note:** The first argument will always be typechecked against your entity type, so if your entity type has required components, you will need to pass a first argument that satisfies these. The remaining arguments are expected to be partials of your entity type.

- b4cee80: **Breaking Change:** `world.queue.createEntity` no longer returns an entity (which didn't make a whole lot of semantic sense to begin with.)

## 0.8.1

### Patch Changes

- 011c384: Change the API signature of `addComponent` to expect a partial entity instead of name and value, to provide a better interface for component factories:

  ```ts
  const position = (x: number = 0, y: number = 0) => ({ position: { x, y } })
  const health = (amount: number) => ({
    health: { max: amount, current: amount }
  })

  world.addComponent(entity, { ...position(), ...health(100) })
  ```
