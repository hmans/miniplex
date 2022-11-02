# miniplex

## 2.0.0-next.19

### Patch Changes

- e0684cd: Removed `IEntityIterator<T>`, just use `Iterable<T>` instead.

## 2.0.0-next.18

### Patch Changes

- 531f4ae: **Breaking Change:** The friendlier, cozier 1.0 API is back. You now create archetypes once again through `world.archetype`:

  ```js
  /* Component name form */
  world.archetype("name")
  world.archetype("name", "age")

  /* Query form (allows for without checks) */
  world.archetype({ with: ["age"], without: ["height"] })
  ```

  These can now be nested:

  ```js
  world.archetype("name").archetype("age")
  ```

  `archetype` also takes a function predicate:

  ```js
  world.archetype("age").archetype((e) => e.age > 18)
  ```

  > **Warning** This will only be evaluated whenever the entity is added to the archetype from its source, and every time components are added to or removed from it, but not when any of the actual component values change.

  **`where` produces a short-lived iterator** that allows a system to only operate on a subset of entities, without creating a new archetype, which in some situations will be much more efficient than creating value-based archetypes and keeping them updated:

  ```js
  const withAge = world.archetype("age")

  for (const entity of withAge.where((e) => e.age > 18)) {
    /* Do something with entity */
  }
  ```

- c6abd0b: Added `.with(...components)` and `.without(...components)` functions to all entity buckets.

  ```js
  /* Equivalent */
  world.with("foo")
  world.archetype("foo")

  /* Equivalent */
  world.without("foo")
  world.archetype({ without: ["foo"] })
  ```

- Updated dependencies [531f4ae]
  - @miniplex/bucket@2.0.0-next.18

## 2.0.0-next.16

### Patch Changes

- 682caf4: Renamed the `WithComponent<E, P>` helper type to `With<E, P>`. Also added the `Strictly<T>` type that removes all non-required properties from a given type. These can be combined to create a type that is a strict version of a specificy type of entity:

  ```ts
  type Player = With<Entity, "isPlayer" | "transform" | "health">

  const players = world.where<Strictly<Player>>(archetype("isPlayer"))
  ```

- 8ff926c: Experimental new `tagged` predicate factory.

## 2.0.0-next.15

### Patch Changes

- 5bf4733: Removed `IEntity` - amazingly, we no longer need it at all!
- 2efcd9e: `isArchetype(entity, query)`, `hasComponents(entity, ...c)`, `hasAnyComponents(entity, ...c)` and `hasNoComponents(entity, ...c)` helpers.
- Updated dependencies [6eee056]
  - @miniplex/bucket@2.0.0-next.13

## 2.0.0-next.12

### Patch Changes

- 252cc0f: `world.archetype` is gone. Instead, there is `world.where(predicate)`. For archetype queries, please use `world.where(archetype("foo", "bar"))`.
- Updated dependencies [252cc0f]
  - @miniplex/bucket@2.0.0-next.12

## 2.0.0-next.11

### Patch Changes

- b11083d: Aaaaah, another rewrite of the core library! `@miniplex/core` kept the same lightweight core, but the `World` is now much more aware of archetypes and what kind of entities they represent. This was done to allow for better introspection and to fix some remaining issues like [#204](https://github.com/hmans/miniplex/issues/204)].

  The `WithRequiredKeys` type has been renamed to `WithComponents`.

  `world.archetype()` now allows two forms:

  ```ts
  world.archetype("position", "velocity")
  world.archetype({ all: ["position", "velocity"] })
  ```

  The second form involves a query object that can also have `any` and `none` keys:

  ```ts
  world.archetype({
    all: ["position", "velocity"],
    none: ["dead"]
  })
  ```

  **Breaking Change:** `bucket.derive()` has been removed. It was cool and fun and cute, but also a little too generic to be useful. Similar to Miniplex 1.0, there is only the _world_ and a series of _archetypes_ now. (But both share the same lightweight `Bucket` base class that can also be used standalone.)

- 43f9cae: Upgraded to a newer `@hmans/event` that uses `.add` and `.remove` instead of `.addListener` and `.removeListener`.

## 2.0.0-next.10

### Patch Changes

- 504086b: Miniplex will now log errors (but not throw) when trying to add components that already exist on the entity, or remove or update components that don't.
- 504086b: Fixed a bug around removal of entities from buckets.

## 2.0.0-next.9

### Patch Changes

- 873381c: Changed type signature of `add` to return the input entity's type. This is an experimental change that may be reverted.

## 2.0.0-next.8

### Patch Changes

- 5a5244e: The global `id(entity)` export has been removed, and replaced with a `World`-specific ID mechanism, `world.id(entity)` and `world.entity(id)`.
- 6808a5d: All buckets can now be instantiated with an initial list of entities.
- c28a404: From "properties" back to "components". The methods on `World` are now once again called `addComponent`, `setComponent` and `removeComponent`, and the React component has been renamed from `<Property>` to `<Component>`.

## 2.0.0-next.6

### Patch Changes

- 10c60f8: Implemented `Bucket.dispose`, which will also dispose of derived buckets properly.
- f92b5f7: Added the `Bucket.onCleared` event, which is emitted when the bucket's `clear` function is invoked.

## 2.0.0-next.5

### Patch Changes

- 16cef4e: Massive performance improvements!
- 1c63f90: Added `World.setProperty`.

## 2.0.0-next.4

### Patch Changes

- 1d26060: Restructured the packages into `@miniplex/core` and `@miniplex/react`, with a main `miniplex` package re-exporting these.

## 2.0.0-next.3

### Patch Changes

- f81bf3e: The `EntityPredicate` type has been renamed to just `Predicate`.
- cf0212e: Iterating over a bucket will now iterate over its entities _in reverse order_, which makes it a little safer to synchronously remove entities from within a system.
- 2af57a6: The `EntityWith` type has been renamed to `WithRequiredKeys`.
- aa3d6d2: `Bucket` can represent any type, not just types extending `IEntity`, so its type parameter has been changed to reflect this.

## 2.0.0-next.1

### Patch Changes

- da62d8c: Fixed the return type of `World.archetype()`.

## 2.0.0-next.0

### Major Changes

- f2406db: 2.0!

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
