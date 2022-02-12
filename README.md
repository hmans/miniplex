# miniplex

A joyfully minimal riff on ECS with a focus on Developer Experience.

# 🚨 WORK IN PROGRESS 🚨

Everything you're seeing here is likely going to change quite a lot in the near future. I've added some preliminary typo-filled documentation to convey an idea of how this thing ticks, but please don't build anything with it right now that you can't risk to have to rewrite a couple of days later. :-P

Questions? Find me on [Twitter](https://twitter.com/hmans) or the [Poimandres Discord](https://discord.gg/aAYjm2p7c7).

### Headline Features

- An absolute, utter, non-negotiable, unbreakable focus on **developer experience**.
- Tiny (~1 KB) and zero dependencies.
- You can use it outside of React, but it comes with great React glue.
- Designed to be used as a utiliy ECS implementation for libraries (but it can also power your project.)
- Actually pretty great performance!

### Main differences from other ECS implementations

- Entities are just normal **JavaScript objects**.
- Components are just **properties on those objects**.
- Component data can be **anything** you need, from primitive values to class instances.
- You can query the world by **archetype** (ie. components present on entities.)
- Everything is referenced by object identity, not numerical IDs. However, entities do automatically get a **built-in `id` component** with an auto-incrementing numerical ID; this is mostly a convenience for situations where you _need_ to provide a unique scalar reference (eg. as the `key` prop when rendering a list of React components.)

### Usage tl;dr

**Optional, but recommended:** Define a type (or interface) that describes your entities:

```ts
type Entity = {
  position?: { x: number; y: number; z: number }
  velocity?: { x: number; y: number; z: number }
} & IEntity
```

Create a world (when you provide a type like here, every interaction with the world will provide full type hints):

```ts
const world = createWorld<Entity>()
```

Add an entity:

```ts
const entity = world.addEntity({ position: { x: 0, y: 0, z: 0 } })
```

Add a component to the entity:

```ts
world.addComponent(entity, "velocity", { x: 10, y: 0, z: 0 })
```

Miniplex queues commands like these, so don't forget to flush the queue to actually execute them:

```ts
world.flush()
```

Create an archetype:

```ts
const movingEntities = world.createArchetype("position", "velocity")
```

Implement a system (in Miniplex, systems are just normal functions that operate on the world, and leaves it up to you to run them):

```ts
function movementSystem(world) {
  for (const { position, velocity } of world.get(movingEntities)) {
    position.x += velocity.x
    position.y += velocity.y
    position.z += velocity.z
  }
}
```

### React

You can use Miniplex without React, but it also provides some code to make it super-fun to use in React projects. All React-specific code is in the `react` module, which you would currently import like this:

```ts
import { createReactIntegration } from "miniplex/dist/react"
```

Now you can pass your existing Miniplex world to this function to get a set of React hooks and components _specific to your world_ (this allows you to easily use multiple Miniplex worlds in parallel, without React contexts tripping over each other):

```ts
const { Entity, Component, useArchetype } = createReactIntegration(world)
```

The `useArchetype` hook lets you get the entities of the specified archetype (similar to the `world.get` above) from within a React component. Most importantly, this hook will make the component _rerender_ if entities are added to or removed from the archetype. This is useful for implementing systems as React components, or writing React components that render entities:

```ts
const MovementSystem = () => {
  const entities = useArchetype(movingEntities)

  useFrame(() => {
    for (const { position, velocity } of entities) {
      position.x += velocity.x
      position.y += velocity.y
      position.z += velocity.z
    }
  })

  return null
}
```

`createReactIntegration` also provides `Entity` and `Component` React components that you can use to declaratively create (or add components to) entities:

```jsx
const Car = () => (
  <Entity>
    <Component name="position" data="{ x: 0, y: 0, z: 0 }" />
    <Component name="position" data="{ x: 10, y: 0, z: 0 }" />
    <Component name="sprite" data="/images/car.png" />
  <Entity>
)
```

**Note:** all of the above is still very much in flux. Please expect things to break. A lot. Like, really.

### TODO

- [x] Draw the owl
- [ ] Document the owl, explain the owl, make the world cherish the owl, explain why the owl is needed, and why among owls, it is king
