# miniplex

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
