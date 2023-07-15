![Miniplex](https://user-images.githubusercontent.com/1061/193760498-fb6b4d42-f48b-48b4-b7c1-b5b5674df55c.jpg)  
[![Version](https://img.shields.io/npm/v/miniplex-react?style=for-the-badge)](https://www.npmjs.com/package/miniplex-react)
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/hmans/miniplex/tests.yml?style=for-the-badge)
[![Downloads](https://img.shields.io/npm/dt/miniplex.svg?style=for-the-badge)](https://www.npmjs.com/package/miniplex)
[![Bundle Size](https://img.shields.io/bundlephobia/min/miniplex?style=for-the-badge&label=bundle%20size)](https://bundlephobia.com/result?p=miniplex)

# Miniplex - the gentle game entity manager.

- 🚀 Manages your game entities using the Entity Component System pattern.
- 🍳 Focuses on ease of use and developer experience.
- 💪 Can power your entire project, or just parts of it.
- 🧩 Written in TypeScript, for TypeScript. (But works in plain JavaScript, too!)
- ⚛️ [React bindings available](https://www.npmjs.com/package/miniplex-react). They're great! (But Miniplex works in any environment.)
- 📦 Tiny package size and minimal dependencies.

## Testimonials

From [verekia](https://twitter.com/verekia):

> **Miniplex has been the backbone of my games for the past year and it has been a delightful experience.** The TypeScript support and React integration are excellent, and the API is very clear and easy to use, even as a first ECS experience.

From [Brian Breiholz](https://twitter.com/BrianBreiholz/status/1577182839509962752):

> Tested @hmans' Miniplex library over the weekend and after having previously implemented an ECS for my wip browser game, I have to say **Miniplex feels like the "right" way to do ECS in #r3f**.

From [VERYBOMB](https://twitter.com/verybomb):

> Rewrote my game with Miniplex and my **productivity has improved immeasurably** ever since. Everything about it is so intuitive and elegant.

## Table of Contents

- [Example](#example)
- [Overview](#overview)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Advanced Usage](#advanced-usage)
- [Best Practices](#best-practices)

## Example

```ts
/* Define an entity type */
type Entity = {
  position: { x: number; y: number }
  velocity?: { x: number; y: number }
  health?: {
    current: number
    max: number
  }
  poisoned?: true
}

/* Create a world with entities of that type */
const world = new World<Entity>()

/* Create an entity */
const player = world.add({
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  health: { current: 100, max: 100 }
})

/* Create another entity */
const enemy = world.add({
  position: { x: 10, y: 10 },
  velocity: { x: 0, y: 0 },
  health: { current: 100, max: 100 }
})

/* Create some queries: */
const queries = {
  moving: world.with("position", "velocity"),
  health: world.with("health"),
  poisoned: queries.health.with("poisoned")
}

/* Create functions that perform actions on entities: */
function damage({ health }: With<Entity, "health">, amount: number) {
  health.current -= amount
}

function points(entity: With<Entity, "poisoned">) {
  world.addComponent(entity, "poisoned", true)
}

/* Create a bunch of systems: */
function moveSystem() {
  for (const { position, velocity } of queries.moving) {
    position.x += velocity.x
    position.y += velocity.y
  }
}

function poisonSystem() {
  for (const { health, poisoned } of queries.poisoned) {
    health.current -= 1
  }
}

function healthSystem() {
  for (const entity of queries.health) {
    if (entity.health.current <= 0) {
      world.remove(entity)
    }
  }
}

/* React to entities appearing/disappearing in queries: */
queries.poisoned.onEntityAdded.subscribe((entity) => {
  console.log("Poisoned:", entity)
})
```

## Overview

**Miniplex is an entity management system for games and similarly demanding applications.** Instead of creating separate buckets for different types of entities (eg. asteroids, enemies, pickups, the player, etc.), you throw all of them into a single store, describe their properties through components, and then write code that performs updates on entities that have specific component configurations.

If you're familiar with **Entity Component System** architecture, this will sound familiar to you &ndash; and rightfully so, for Miniplex is, first and foremost, a very straight-forward implementation of this pattern!

If you're hearing about this approach for the first time, maybe it will sound a little counter-intuitive &ndash; but once you dive into it, you will understand how it can help you decouple concerns and keep your codebase well-structured and maintainable. A nice forum post that I can't link to because it's gone offline had a nice explanation:

> An ECS library can essentially be thought of as an API for performing a loop over a homogeneous set of entities, filtering them by some condition, and pulling out a subset of the data associated with each entity. The goal of the library is to provide a usable API for this, and to do it as fast as possible.

For a more in-depth explanation, please also see Sander Mertens' wonderful [Entity Component System FAQ](https://github.com/SanderMertens/ecs-faq).

### Differences from other ECS libraries

If you've used other Entity Component System libraries before, here's how Miniplex is different from some of them:

#### Entities are just normal JavaScript objects

Entities are just **plain JavaScript objects**, and components are just **properties on those objects**. Component data can be **anything** you need, from primitive values to entire class instances, or even [entire reactive stores](https://github.com/hmans/statery). Miniplex puts developer experience first, and the most important way it does this is by making its usage feel as natural as possible in a JavaScript environment.

Miniplex does not expect you to programmatically declare component types before using them; if you're using TypeScript, you can provide a type describing your entities and Miniplex will provide full edit- and compile-time type hints and safety. (Hint: you can even write some classes and use their instances as entities!)

#### Miniplex does not have a built-in notion of systems

Unlike the majority of ECS libraries, Miniplex does not have any built-in notion of systems, and does not perform any of its own scheduling. This is by design; your project will likely already have an opinion on how to schedule code execution, informed by whatever framework you are using; instead of providing its own and potentially conflicting setup, Miniplex will neatly snuggle into the one you already have.

Systems are extremely straight-forward: just write simple functions that operate on the Miniplex world, and run them in whatever fashion fits best to your project (`setInterval`, `requestAnimationFrame`, `useFrame`, your custom ticker implementation, and so on.)

#### Archetypal Queries

Entity queries are performed through **archetypal queries**, with individual queries indexing and holding a subset of your world's entities that have (or don't have) a specific set of components.

#### Focus on Object Identities over numerical IDs

Most interactions with Miniplex are using **object identity** to identify entities (instead of numerical IDs). Miniplex provides an optional lightweight mechanism to generate unique IDs for your entities if you need them. In more complex projects that need stable entity IDs, especially when synchronizing entities across the network, the user is encouraged to implement their own ID generation and management.

## Installation

Add the `miniplex` package to your project using your favorite package manager:

```bash
npm add miniplex
yarn add miniplex
pnpm add miniplex
```

## Basic Usage

Miniplex can be used in any JavaScript or TypeScript project, regardless of which extra frameworks you might be using. This document focuses on how to use Miniplex without a framework, but please also check out the framework-specific documentation available:

- [miniplex-react](https://github.com/hmans/miniplex/blob/main/packages/react/README.md)

### Creating a World

Miniplex manages entities in **worlds**, which act as containers for entities as well as an API for interacting with them. You can have one big world in your project, or several smaller worlds handling separate sections of your game.

```ts
import { World } from "miniplex"

const world = new World()
```

### Typing your Entities (optional, but recommended!)

If you're using TypeScript, you can define a type that describes your entities and provide it to the `World` constructor to get full type support in all interactions with it:

```ts
import { World } from "miniplex"

type Entity = {
  position: { x: number; y: number; z: number }
  velocity?: { x: number; y: number; z: number }
  health?: number
  paused?: true
}

const world = new World<Entity>()
```

### Creating Entities

The main interactions with a Miniplex world are creating and destroying entities, and adding or removing components from these entities. Entities are just plain JavaScript objects that you pass into the world's `add` and `remove` functions, like here:

```ts
const entity = world.add({ position: { x: 0, y: 0, z: 0 } })
```

We've directly added a `position` component to the entity. If you're using TypeScript, the component values here will be type-checked against the type you provided to the `World` constructor.

> **Note** Adding the entity will make it known to the world and all relevant queries, but it will not change the entity object itself in any way. In Miniplex, entities can _live in multiple worlds at the same time_! This allows you to split complex simulations into entirely separate worlds, each with their own queries, even though they might share some (or all) entities.

### Adding Components

The `World` instance provides `addComponent` and `removeComponent` functions for adding and removing components from entities. Let's add a `velocity` component to the entity. Note that we're passing the entity itself as the first argument:

```ts
world.addComponent(entity, "velocity", { x: 10, y: 0, z: 0 })
```

Now the entity has two components: `position` and `velocity`.

### Querying Entities

Let's write some code that moves entities, which have a `position`, according to their `velocity`. You will typically implement this as something called a **system**, which, in Miniplex, is typically just a normal function that fetches the entities it is interested in, and then performs some operation on them.

Fetching only the entities that a system is interested in is the most important part in all this, and it is done through something called **queries** that can be thought of as something similar to database indices.

Since we're going to _move_ entities, we're interested in entities that have both the `position` and `velocity` components, so let's create a query for that:

```ts
/* Get all entities with position and velocity */
const movingEntities = world.with("position", "velocity")
```

> **Note** There is also `without`, which will return all entities that do _not_ have the specified components:
>
> ```ts
> const active = world.without("paused")
> ```
>
> Queries can also be nested:
>
> ```ts
> const movingEntities = world.with("position", "velocity").without("paused")
> ```

### Implementing Systems

Now we can implement a system that operates on these entities! Miniplex doesn't have an opinion on how you implement systems – they can be as simple as a function. Here's a system that uses the `movingEntities` query we created in the previous step, iterates over all entities in it, and moves them according to their velocity:

```ts
function movementSystem() {
  for (const { position, velocity } of movingEntities) {
    position.x += velocity.x
    position.y += velocity.y
    position.z += velocity.z
  }
}
```

**Note:** Since entities are just plain JavaScript objects, they can easily be destructured into their components, like we're doing above.

Now all we need to do is make sure that this system is run on a regular basis. If you're writing a game, the framework you are using will already have a mechanism that allows you to execute code once per frame; just call the `movementSystem` function from there!

### Destroying Entities

At some point we may want to remove an entity from the world (for example, an enemy spaceship that got destroyed by the player). We can do this through the world's `remove` function:

```ts
world.remove(entity)
```

This will immediately remove the entity from the Miniplex world and all existing queries.

> **Note** While this will remove the entity object from the world, it will not destroy or otherwise change the object itself. In fact, you can just add it right back into the world if you want to!

## Advanced Usage

We're about to dive into some advanced usage patterns. Please make sure you're familiar with the basics before continuing.

### Reacting to added/removed entities

Instances of `World` and `Query` provide the built-in `onEntityAdded` and `onEntityRemoved` events that you can subscribe to to be notified about entities appearing or disappearing.

For example, in order to be notified about any entity being added to the world, you may do this:

```ts
world.onEntityAdded.subscribe((entity) => {
  console.log("A new entity has been spawned:", entity)
})
```

This is useful for running system-specific initialization code on entities that appear in specific queries:

```ts
const withHealth = world.with("health")

withHealth.onEntityAdded.subscribe((entity) => {
  entity.health.current = entity.health.max
})
```

### Predicate Queries using `where`

Typically, you'll want to build queries the check entities for the _presence_ of specific components; you have been using the `with` and `without` functions for this so far. But there may be the rare case where you want to query by _value_; for this, Miniplex provides the `where` function. It allows you to specify a predicate function that your entity will be checked against:

```ts
const damagedEntities = world
  .with("health")
  .where(({ health }) => health.current < health.max)

const deadEntities = world.with("health").where(({ health }) => health <= 0)
```

It is _extremely_ important to note that queries that use `where` are in no way reactive; if the values within the entity change in a way that would change the result of your predicate function, Miniplex will _not_ pick this up automatically.

Instead, once you know that you are using `where` to inspect component _values_, you are required to signal an updated entity by calling the `reindex` function:

```ts
function damageEntity(entity: With<Entity, "health">, amount: number) {
  entity.health.current -= amount
  world.reindex(entity)
}
```

Depending on the total number of queries you've created, reindexing can be a relatively expensive operation, so it is recommended that you use this functionality with care. Most of the time, it is more efficient to model things using additional components. The above example could, for example, be rewritten like this:

```ts
const damagedEntities = world.with("health", "damaged")

const deadEntities = world.with("health", "dead")

function damageEntity(entity: With<Entity, "health">, amount: number) {
  entity.health.current -= amount

  if (entity.health.current < entity.health.max) {
    world.addComponent(entity, "damaged")
  }

  if (entity.health.current <= 0) {
    world.addComponent(entity, "dead")
  }
}
```

### ID Generation

When interacting with Miniplex, entities are typically identified using their _object identities_, which is one of the ways where Miniplex is different from typical ECS implementations, which usually make use of numerical IDs.

Most Miniplex workloads can be implemented without the use of numerical IDs, but if you ever _do_ need such an identifier for your entities &ndash; possibly because you're wiring them up to another non-Miniplex system that expects them &ndash; Miniplex worlds provide a lightweight mechanism to generate them:

```ts
const entity = world.add({ count: 10 })
const id = world.id(entity)
```

You can later use this ID to look up the entity in the world:

```ts
const entity = world.entity(id)
```

## Best Practices

### Use `addComponent` and `removeComponent` for adding and removing components

Since entities are just normal objects, you might be tempted to just add new properties to (or delete properties from) them directly. **This is a bad idea** because it will skip the indexing step needed to make sure the entity is listed in the correct queries. Please always go through `addComponent` and `removeComponent`!

It is perfectly fine to mutate component _values_ directly, though.

```ts
/* ✅ This is fine: */
const entity = world.add({ position: { x: 0, y: 0, z: 0 } })
entity.position.x = 10

/* ⛔️ This is not: */
const entity = world.add({ position: { x: 0, y: 0, z: 0 } })
entity.velocity = { x: 10, y: 0, z: 0 }
```

### Iterate over queries using `for...of`

The world as well as all queries derived from it are _iterable_, meaning you can use them in `for...of` loops. This is the recommended way to iterate over entities in a query, as it is highly performant, and iterates over the entities _in reverse order_, which allows you to safely remove entities from within the loop.

```ts
const withHealth = world.with("health")

/* ✅ Recommended: */
for (const entity of withHealth) {
  if (entity.health <= 0) {
    world.remove(entity)
  }
}

/* ⛔️ Avoid: */
for (const entity of withHealth.entities) {
  if (entity.health <= 0) {
    world.remove(entity)
  }
}

/* ⛔️ Especially avoid: */
withHealth.entities.forEach((entity) => {
  if (entity.health <= 0) {
    world.remove(entity)
  }
})
```

### Reuse queries where possible

The functions creating and returning queries (`with`, `without`, `where`) aim to be idempotent and will reuse existing queries for the same set of query attributes. Checking if a query for a specific set of query attributes already exists is a comparatively heavyweight function, though, and you are advised to, wherever possible, reuse previously created queries.

```ts
/* ✅ Recommended: */
const movingEntities = world.with("position", "velocity")

function movementSystem() {
  for (const { position, velocity } of movingEntities) {
    position.x += velocity.x
    position.y += velocity.y
    position.z += velocity.z
  }
}

/* ⛔️ Avoid: */
function movementSystem(world) {
  /* This will work, but now the world needs to check if a query for "position" and "velocity" already exists every time this function is called, which is pure overhead. */
  for (const { position, velocity } of world.with("position", "velocity")) {
    position.x += velocity.x
    position.y += velocity.y
    position.z += velocity.z
  }
}
```

## Questions?

If you have questions about Miniplex, you're invited to post them in our [Discussions section](https://github.com/hmans/miniplex/discussions) on GitHub.

## License

```
Copyright (c) 2023 Hendrik Mans

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
