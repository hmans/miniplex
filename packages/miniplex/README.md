[![Tests](https://github.com/hmans/miniplex/actions/workflows/tests.yml/badge.svg)](https://github.com/hmans/miniplex/actions/workflows/tests.yml)
[![Downloads](https://img.shields.io/npm/dt/miniplex.svg)](https://www.npmjs.com/package/miniplex)
[![Bundle Size](https://img.shields.io/bundlephobia/min/miniplex?label=bundle%20size)](https://bundlephobia.com/result?p=miniplex)

# Miniplex

## Ecosystem

- [![Version](https://img.shields.io/npm/v/miniplex)](https://www.npmjs.com/package/miniplex) [miniplex](https://github.com/hmans/miniplex/tree/main/packages/miniplex)
- [![Version](https://img.shields.io/npm/v/miniplex-react)](https://www.npmjs.com/package/miniplex-react) [miniplex-react](https://github.com/hmans/miniplex/tree/main/packages/miniplex-react)

## Introduction

**Miniplex is an entity management system for games and similarly demanding applications.** Instead of creating separate buckets for different types of entities (eg. asteroids, enemies, pickups, the player, etc.), you throw all of them into a single store, describe their properties through components, and then write code that performs updates on entities of specific types.

If you're familiar with Entity Component System architecture, this will sound familiar to you -- and rightfully so, for Miniplex is, first and foremost, a very straight-forward ECS implementation.

If you're hearing about this approach for the first time, maybe it will sound a little counter-intuitive -- but once you dive into it, you will understand how it can help you decouple concerns and keep your codebase well-structured and maintainable. [This post](https://community.amethyst.rs/t/archetypal-vs-grouped-ecs-architectures-my-take/1344) has a nice summary:

> An ECS library can essentially thought of as an API for performing a loop over a homogeneous set of entities, filtering them by some condition, and pulling out a subset of the data associated with each entity. The goal of the library is to provide a usable API for this, and to do it as fast as possible.

For a more in-depth explanation, please also see Sander Mertens' wonderful [Entity Component System FAQ](https://github.com/SanderMertens/ecs-faq).

## Headline Features

- A very strong focus on **developer experience**. Miniplex aims to be the most convenient to use ECS implementation while still providing great performance.
- **[Tiny package size](https://bundlephobia.com/package/miniplex)** and **minimal dependencies**.
- React glue available through [miniplex-react](https://www.npmjs.com/package/miniplex-react).
- Can power your entire project or just parts of it.
- Written in **TypeScript**, with full type checking for your entities.

## Main differences from other ECS libraries

If you've used other Entity Component System libraries before, here's how Miniplex is different from some of them:

### Entities are just normal JavaScript objects

Entities are just **plain JavaScript objects**, and components are just **properties on those objects**. Component data can be **anything** you need, from primitive values to entire class instances, or even [reactive stores](https://github.com/hmans/statery). Miniplex aims to put developer experience first, and the most important way it does this is by making its usage feel as natural as possible in a JavaScript setting.

Miniplex does not expect you to programmatically declare component types before using them, but if you're using TypeScript, you can provide a type describing your entities and Miniplex will provide full edit- and compile-time type hints and safety.

### Miniplex does not have a built-in notion of systems

Unlike the majority of ECS libraries, Miniplex does not have any built-in notion of systems, and does not perform any of its own scheduling. This is by design; your project will likely already have an opinion on how to schedule code execution, and instead of providing its own and potentially conflicting setup, Miniplex will neatly snuggle into the one you already have.

Systems are extremely straight-forward: just write simple functions that operate on the Miniplex world, and run them in whatever fashion fits best to your project (`setInterval`, `requestAnimationFrame`, `useFrame`, your custom ticker implementation, and so on.)

### Archetypal Queries

Entity queries are performed through **archetypes**, with archetypes representing a subset of your world's entities that have a specific set of components. More complex querying capabilities may be added at a later date.

### Focus on Object Identities over numerical IDs

Most interactions with Miniplex are using **object identity** to identify entities or archetypes (instead of numerical IDs). However, entities do automatically get a **built-in `id` component** with an auto-incrementing numerical ID once they're added to the world; this is mostly meant as a convenience for situations where you _need_ to provide a unique scalar reference (eg. as the `key` prop when rendering a list of entities as React components.)

## Basic Usage

Miniplex can be used in any JavaScript or TypeScript project, regardless of which extra frameworks you might be using. Integrations with frameworks like React are provided as separate packages, so here we will only talk about framework-less usage.

### Creating a World

Miniplex manages entities in worlds, which act as a containers for entities as well as an API for interacting with them. You can have one big world in your project, or several smaller worlds handling separate concerns.

```ts
import { World } from "miniplex"

const world = new World()
```

### Typing your Entities (optional)

If you're using TypeScript, you can define a type that describes your entities and provide it to the `World` constructor to get full type support in all interactions with it:

```ts
import { World } from "miniplex"

type Entity = {
  position: { x: number; y: number; z: number }
  velocity?: { x: number; y: number; z: number }
  health?: number
}

const world = new World<Entity>()
```

### Creating Entities

The main interactions with a Miniplex world are creating and destroying entities, and adding or removing components from these entities.

Let's create an entity. Note how we're immediately giving it a `position` component:

```ts
const entity = world.createEntity({ position: { x: 0, y: 0, z: 0 } })
```

### Adding Components

Now let's add a `velocity` component to the entity. Note that we're passing the entity itself, not just its identifier:

```ts
world.addComponent(entity, "velocity", { x: 10, y: 0, z: 0 })
```

Now the entity has two components: `position` and `velocity`.

> **Note** Once added to the world, entities also automatically receive an internal `__miniplex` component. This component contains data that helps Miniplex track the entity's lifecycle, and optimize a lot of interactions with the world, and you can safely ignore it.

### Querying Entities

We're going to write some code that moves entities according to their velocity. You will typically implement this as something called a **system**, which, in Miniplex, are typically just normal functions that fetch the entities they are interested in, and then perform some operation on them.

Fetching only the entities that a system is interested in is the most important part in all this, and it is done through something called **archetypes** that can be thought of as something akin to database indices.

Since we're going to move entities, we're interested in entities that have both the `position` and `velocity` components, so let's create an archetype for that:

```ts
const movingEntities = world.archetype("position", "velocity")
```

### Implementing Systems

Now we can implement our system, which is really just a function -- or any other piece of code -- that uses the archetype to fetch the associated entities and then iterates over them:

```ts
function movementSystem(world) {
  for (const { position, velocity } of movingEntities.entities) {
    position.x += velocity.x
    position.y += velocity.y
    position.z += velocity.z
  }
}
```

**Note:** Since entities are just plain JavaScript objects, they can easily be destructured into their components, like we're doing above.

### Destroying Entities

At some point we may want to remove an entity from the world (for example, an enemy spaceship that got destroyed by the player):

```ts
world.destroyEntity(entity)
```

This will immediately remove the entity from the Miniplex world and all associated archetypes.

### Queued Commands

All functions that modify the world (`createEntity`, `destroyEntity`, `addComponent` and `removeComponent`) also provide an alternative function that will not perform the action immediately, but instead put it into a queue:

```ts
world.queue.destroyEntity(bullet)
```

Once you're ready to execute the queued operations, you can flush the queue likes this:

```ts
world.queue.flush()
```

**Note:** Please remember that the queue is not flushed automatically, and doing this is left to you. You might, for example, do this in your game's main loop, after all systems have finished executing.

## Usage Hints

### Do not add or remove entity properties directly

Since entities are just normal objects, you might be tempted to just add new properties to (or delete properties from) them directly. **This is a bad idea** because it will skip the indexing step needed to make sure the entity is listed in the correct archetypes. Please always go through `addComponent` and `removeComponent`!

## Performance Hints

### Prefer `for` over `forEach`

You might be tempted to use `forEach` in your system implementations, like this:

```ts
function movementSystem(world) {
  movingEntities.entities.forEach(({ position, velocity }) => {
    position.x += velocity.x
    position.y += velocity.y
    position.z += velocity.z
  })
}
```

This will incur a modest, but noticeable performance penalty, since you would be calling and returning from a function for every entity in the archetype. It is typically recommended to use either a `for/of` loop:

```ts
function movementSystem(world) {
  for (const { position, velocity } of movingEntities.entities) {
    position.x += velocity.x
    position.y += velocity.y
    position.z += velocity.z
  }
}
```

Or a classic `for` loop:

```ts
function movementSystem(world) {
  const len = movingEntities.entities.length

  for (let i = 0; i < len; i++) {
    const { position, velocity } = movingEntities.entities[i]
    position.x += velocity.x
    position.y += velocity.y
    position.z += velocity.z
  }
}
```

If your system code will under some circumstances immediately remove entities, you might even want to go the safest route of iterating through the collection in reversed order:

```ts
const withHealth = world.archetype("health")

function healthSystem(world) {
  const len = withHealth.entities.length

  /* Note how we're going through the list in reverse order: */
  for (let i = len; i > 0; i--) {
    const entity = withHealth.entities[i - 1]

    /* If health is depleted, destroy the entity */
    if (entity.health <= 0) {
      world.destroyEntity(entity)
    }
  }
}
```

### Reuse archetypes where possible

The `archetype` function aims to be idempotent and will reuse existing archetypes for the same queries passed to it, so you will never risk accidentally creating multiple indices of the same archetypes. It is, however, a comparatively heavyweight function, and you are advised to, wherever possible, reuse previously created archetypes.

For example, creating your archetypes within a system function like this will work, but unnecessarily create additional overhead, and is thus not recommended:

```ts
function movementSystem(world) {
  const movingEntities = world.archetype("position", "velocity")

  for (const { position, velocity } of movingEntities.entities) {
    position.x += velocity.x
    position.y += velocity.y
    position.z += velocity.z
  }
}
```

Instead, create the archetype outside of your system:

```ts
const movingEntities = world.archetype("position", "velocity")

function movementSystem(world) {
  for (const { position, velocity } of movingEntities.entities) {
    position.x += velocity.x
    position.y += velocity.y
    position.z += velocity.z
  }
}
```

## Questions?

Find me on [Twitter](https://twitter.com/hmans) or the [Poimandres Discord](https://discord.gg/aAYjm2p7c7).
