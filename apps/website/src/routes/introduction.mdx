---
title: Introduction
---

# Introduction

![Miniplex](https://user-images.githubusercontent.com/1061/193760498-fb6b4d42-f48b-48b4-b7c1-b5b5674df55c.jpg)
[![Version](https://img.shields.io/npm/v/miniplex-react?style=for-the-badge)](https://www.npmjs.com/package/miniplex-react)
[![Tests](https://img.shields.io/github/workflow/status/hmans/miniplex/Tests?label=CI&style=for-the-badge)](https://github.com/hmans/miniplex/actions/workflows/tests.yml)
[![Downloads](https://img.shields.io/npm/dt/miniplex.svg?style=for-the-badge)](https://www.npmjs.com/package/miniplex)
[![Bundle Size](https://img.shields.io/bundlephobia/min/miniplex?style=for-the-badge&label=bundle%20size)](https://bundlephobia.com/result?p=miniplex)

> **Warning** You are looking at the work-in-progress documentation for the upcoming **version 2.0** of Miniplex and its companion libraries. If you're looking for 1.0 documentation, [please go here](https://github.com/hmans/miniplex/tree/miniplex%401.0.0).

## Testimonials

From [Jonathan Verrecchia](https://twitter.com/verekia):

> **Miniplex has been the backbone of my games for the past 6 months and it has been a delightful experience.** The TypeScript support and React integration are excellent, and the API is very clear and easy to use, even as a first ECS experience.

From [Brian Breiholz](https://twitter.com/BrianBreiholz/status/1577182839509962752):

> Tested @hmans' Miniplex library over the weekend and after having previously implemented an ECS for my wip browser game, I have to say **Miniplex feels like the "right" way to do ECS in #r3f**.

## Overview

**Miniplex is an entity management system for games and similarly demanding applications.** Instead of creating separate buckets for different types of entities (eg. asteroids, enemies, pickups, the player, etc.), you throw all of them into a single store, describe their properties through components, and then write code that performs updates on entities of specific types.

If you're familiar with **Entity Component System** architecture, this will sound familiar to you &ndash; and rightfully so, for Miniplex is, first and foremost, a very straight-forward ECS implementation!

If you're hearing about this approach for the first time, maybe it will sound a little counter-intuitive &ndash; but once you dive into it, you will understand how it can help you decouple concerns and keep your codebase well-structured and maintainable. [This post](https://community.amethyst.rs/t/archetypal-vs-grouped-ecs-architectures-my-take/1344) has a nice summary:

> An ECS library can essentially thought of as an API for performing a loop over a homogeneous set of entities, filtering them by some condition, and pulling out a subset of the data associated with each entity. The goal of the library is to provide a usable API for this, and to do it as fast as possible.

For a more in-depth explanation, please also see Sander Mertens' wonderful [Entity Component System FAQ](https://github.com/SanderMertens/ecs-faq).

### Headline Features

- A very strong focus on **developer experience**. Miniplex aims to be the most convenient to use ECS implementation while still providing great performance.
- **[Tiny package size](https://bundlephobia.com/package/miniplex)** and **minimal dependencies**.
- React glue available through [@miniplex/react](https://www.npmjs.com/package/miniplex-react), maybe more in the future?
- Can power your entire project or just parts of it.
- Written in **TypeScript**, with full type checking for your entities.

### Differences from other ECS libraries

If you've used other Entity Component System libraries before, here's how Miniplex is different from some of them:

#### Entities are just normal JavaScript objects

Entities are just **plain JavaScript objects**, and components are just **properties on those objects**. Component data can be **anything** you need, from primitive values to entire class instances, or even [entire reactive stores](https://github.com/hmans/statery). Miniplex puts developer experience first, and the most important way it does this is by making its usage feel as natural as possible in a JavaScript environment.

Miniplex does not expect you to programmatically declare component types before using them; if you're using TypeScript, you can provide a type describing your entities and Miniplex will provide full edit- and compile-time type hints and safety.

#### Miniplex does not have a built-in notion of systems

Unlike the majority of ECS libraries, Miniplex does not have any built-in notion of systems, and does not perform any of its own scheduling. This is by design; your project will likely already have an opinion on how to schedule code execution, and instead of providing its own and potentially conflicting setup, Miniplex will neatly snuggle into the one you already have.

Systems are extremely straight-forward: just write simple functions that operate on the Miniplex world, and run them in whatever fashion fits best to your project (`setInterval`, `requestAnimationFrame`, `useFrame`, your custom ticker implementation, and so on.)

#### Archetypal Queries

Entity queries are performed through **archetypes**, with individual archetypes representing a subset of your world's entities that have (or don't have) a specific set of components, and/or match a specific predicate.

#### Focus on Object Identities over numerical IDs

Most interactions with Miniplex are using **object identity** to identify entities or archetypes (instead of numerical IDs). Miniplex provides a lightweight mechanism to generate unique IDs for your entities, but it is entirely optional. In more complex projects that need stable entity IDs, the user is encouraged to implement their own ID generation and management.

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

/* Create some archetype queries: */
const archetypes = {
  moving: world.with("position", "velocity"),
  health: world.with("health"),
  poisoned: archetypes.health.with("poisoned")
}

/* Create functions that perform actions on entities: */
function damage({ health }: With<Entity, "health">, amount: number) {
  health.current -= amount
}

function poison(entity: Entity) {
  world.addComponent(entity, "poison", true)
}

/* Create a bunch of systems: */
function moveSystem() {
  for (const { position, velocity } of archetypes.moving) {
    position.x += velocity.x
    position.y += velocity.y
  }
}

function poisonSystem() {
  for (const { health, poisoned } of archetypes.poisoned) {
    health.current -= 1
  }
}

function healthSystem() {
  for (const entity of archetypes.health.where(
    ({ health }) => health.current <= 0
  )) {
    world.removeEntity(entity)
  }
}

/* React to entities appearing/disappearing in archetypes: */
archetypes.poisoned.onEntityAdded((entity) => {
  console.log("Poisoned:", entity)
})
```
