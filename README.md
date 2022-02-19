# Miniplex

## Introduction

**Miniplex is an entity management system for games and similarly demanding applications.** Instead of creating separate buckets for different types of entities (eg. asteroids, enemies, pickups, the player, etc.), you throw all of them into a single store, describe their properties through components, and then write code that performs updates on entities of specific types.

If you're familiar with Entity Component System architecture, this will sound familiar to you -- and rightfully so, for Miniplex is, first and foremost, a very straight-forward ECS implementation.

If you're hearing about this approach for the first time, it may sound counter-intuitive -- but once you dive into it, you will understand how it can help you decouple concerns and keep your codebase well-structured and maintainable. [This post](https://community.amethyst.rs/t/archetypal-vs-grouped-ecs-architectures-my-take/1344) has a nice summary:

> An ECS library can essentially thought of as an API for performing a loop over a homogeneous set of entities, filtering them by some condition, and pulling out a subset of the data associated with each entity. The goal of the library is to provide a usable API for this, and to do it as fast as possible.

### Headline Features

- A very strong focus on **developer experience**.
- **Tiny package size** and **zero dependencies**.
- Use it with or without React.
- Can power your entire project or just parts of it.
- Written in TypeScript, with full type checking for your entities.

### Main differences from other ECS implementations

If you've used other Entity Component System implementations before, here's how Miniplex is probably different from them:

#### Entities are just normal JavaScript objects

Components are just **properties on those objects**. Component data can be **anything** you need, from primitive values to entire class instances, or even [reactive stores](https://github.com/hmans/statery). Miniplex puts developer experience first, and the most important way it does this is by making its usage feel as natural as possible in a JavaScript setting.

Miniplex does not expect you to programmatically declare component types before using them, but if you're using TypeScript, it will provide full edit- and compile-time type safety to your entities and components if you need it.

#### Miniplex does not have a built-in notion of systems

Unlike most other ECS implementations, Miniplex does not have any built-in notion of systems, and does not perform any of its own scheduling. This is by design; your project will likely already have an opinion on how to schedule code execution, and instead of providing its own and potentially conflicting setup, Miniplex will neatly snuggle into the one you already have. Systems can be simple functions that operate on a Miniplex world, and their execution is left up to you.

#### Archetypal Queries

Entity queries are performed through **archetypes**. Miniplex allows you to do "simple complex queries" that should cover most, if not all, use cases, without going overboard with query language DSLs.

#### Focus on Object Identities over numerical IDs

Most interactions with Miniplex are using **object identity** to identify entities or archetypes (instead of numerical IDs). However, entities do automatically get a **built-in `id` component** with an auto-incrementing numerical ID once they're added to the world; this is mostly meant as a convenience for situations where you _need_ to provide a unique scalar reference (eg. as the `key` prop when rendering a list of entities as React components.)

## Basic Usage

Miniplex can be used in any JavaScript or TypeScript project, regardless of which extra frameworks you might be using. Some optional React glue is provided, but let's talk about framework-less usage first.

**Optional, but recommended:** Define a type that describes your entities:

```ts
type Entity = {
  position: { x: number; y: number; z: number }
  velocity?: { x: number; y: number; z: number }
  health?: number
} & IEntity
```

Create a world (when you provide a type like here, every interaction with the world will provide full type hints):

```ts
import { World } from "miniplex"

const world = new World<Entity>()
```

The main interactions with this world consist of adding and removing entities, and adding or removing components from these entities.

Let's add an entity. Note how we're immediately giving it a `position` component:

```ts
const entity = world.addEntity({ position: { x: 0, y: 0, z: 0 } })
```

Now let's add a `velocity` component to the entity:

```ts
world.addComponent(entity, "velocity", { x: 10, y: 0, z: 0 })
```

We're going to write some code that moves entities according to their velocity. You will typically implement this as something called a **system**, which, with Miniplex, are typically just normal functions that fetch the entities they are interested in, and then perform some operation on them.

Create an archetype:

```ts
const movingEntities = world.createArchetype("position", "velocity")
```

Implement a system (in Miniplex, systems are just normal functions that operate on the world, and leaves it up to you to run them):

```ts
function movementSystem(world) {
  for (const { position, velocity } of movingEntities.entities) {
    position.x += velocity.x
    position.y += velocity.y
    position.z += velocity.z
  }
}
```

### Queued Commands

All functions that modify the world (`addEntity`, `removeEntity`, `addComponent` and `removeComponent`) also provide a `queued` version that will not perform the action immediately, but instead put it into a queue:

```ts
world.removeEntity.queued(bullet)
```

The queue can be executed and flushed through `flushQueue`:

```ts
world.flushQueue()
```

### React

You can use Miniplex without React, but it also provides some code to make it super-fun to use in React projects. All React-specific code is in the `miniplex/react` module:

```ts
import { createReactIntegration } from "miniplex/react"
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

## Questions?

Find me on [Twitter](https://twitter.com/hmans) or the [Poimandres Discord](https://discord.gg/aAYjm2p7c7).
