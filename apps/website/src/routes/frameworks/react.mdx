# Using Miniplex in React

## Introduction

Miniplex' React integration allows you to **render existing entities using JSX**, but also **create new entities**, or **extend** existing ones with new components.

## Setup

First, you'll need to create a set of React components that represent your Miniplex world. You can do this by using the `createReactAPI` function that is exported by the `miniplex/react` module:

```ts
import { World } from "miniplex"
import { createReactAPI } from "miniplex/react"

const world = new World()
const ECS = createReactAPI(world)
```

> **Note:** You might be wondering why we're going through the trouble of creating a set of components for the given world, instead of passing the world down via context. The reason is twofold:
>
> 1. When using TypeScript, these generated components will know the entity type of the world they represent, giving you proper autocomplete and type hints when using them.
>
> 2. Since you can have multiple separate worlds (both in your own project, but maybe also because some dependencies of your project use Miniplex), you would quickly run into problems if you were to use a single context for all of them. By creating a set of components for each world, you can use them independently of each other.

## Rendering Entities

One of the most basic things you can do with Miniplex' React bindings is to loop over a set of entities and render some React elements for each of them. This can be done using the `<Entities>` component. Here's an example where we render some JSX for every entity that's currently in the world:

```tsx
const RenderEverything = () => (
  <ECS.Entities in={world}>
    <p>Hello world!</p>
  </ECS.Entities>
)
```

Usually, you won't often do this for _all_ entities in the world, but only a subset. You can pass a reference to an archetype to the `in` prop instead`:

```tsx
const RenderUsers = () => (
  <ECS.Entities in={world.with("name")}>
    <p>Hello world!</p>
  </ECS.Entities>
)
```

Very often, the inner JSX will need to access the entity's components. You can do this by passing a function as the child of the `<Entities>` component. The function will be called with the entity as its argument:

```tsx
const RenderUsers = () => (
  <ECS.Entities in={world.with("name")}>
    {(entity) => <p>Hello {entity.name}!</p>}
  </ECS.Entities>
)
```

Since entities are just normal JavaScript objects, their components are just object properties, and React function components are just, well, _functions_, you can simply specify the name of a React component via the `children` prop like this:

```tsx
const User = ({ name }) => <p>Hello {name}!</p>

const RenderUsers = () => (
  <ECS.Entities in={world.with("name")} children={User} />
)
```

> **Note:** If you're passing an archetype (or world) to the `in` prop, the `<Entities>` component will automatically subscribe to _changes_ to that archetype. This does not refer to _changes within the component data of entities_, but to _changes in the set of entities_ inside the archetype.
>
> This means that the `<Entities>` component will automatically re-render when entities appear in or disappear from the archetype. Entities will be wrapped in a `React.memo` call to make sure they're not re-rendered all the time.
>
> **If you do not want `<Entities>` to automatically re-render like this**, make sure you pass it an _array_ of entities instead of an archetype instance:
>
> ```jsx
> const RenderUsers = () => (
>   <ECS.Entities in={world.with("name").entities}>
>     {(entity) => <p>Hello {entity.name}!</p>}
>   </ECS.Entities>
> )
> ```

## Subscribing to Archetypes

_TODO_

## Creating New Entities

_TODO_

## Capturing Elements

_TODO_
