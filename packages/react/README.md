[![Tests](https://img.shields.io/github/workflow/status/hmans/miniplex/Tests?label=CI&style=for-the-badge)](https://github.com/hmans/miniplex/actions/workflows/tests.yml)
[![Downloads](https://img.shields.io/npm/dt/miniplex-react.svg?style=for-the-badge)](https://www.npmjs.com/package/miniplex-react)
[![Bundle Size](https://img.shields.io/bundlephobia/min/miniplex-react?style=for-the-badge&label=bundle%20size)](https://bundlephobia.com/result?p=miniplex-react)

# miniplex-react

### React glue for [miniplex], the gentle game entity manager.

> **Note** This package contains the React glue for Miniplex. This documentation assumes that you are familiar with how Miniplex works. If you haven't done so already, please read the [Miniplex documentation](https://github.com/hmans/miniplex/tree/main/packages/core#readme) first.

## Installation

Add `miniplex-react` and its peer dependency `miniplex` to your application using your favorite package manager, eg.

```sh
npm install miniplex miniplex-react
yarn add miniplex miniplex-react
pnpm add miniplex miniplex-react
```

## Usage

This package's default export is a function that returns an object with React bindings for an existing miniplex world.

It is recommended that you invoke this function from a module in your application that exports the generated object, and then have the rest of your project import that module, similar to how you would provide a global store:

```ts
/* state.ts */
import { World } from "miniplex"
import createReactAPI from "miniplex-react"

/* Our entity type */
export type Entity = {
  /* ... */
}

/* Create a Miniplex world that holds our entities */
const world = new World<Entity>()

/* Create and export React bindings */
export const ECS = createReactAPI(world)
```

**TypeScript note:** `createReactAPI` will automatically pick up the entity type attached to your world. All the React components and hooks will automatically make use of this type.

### The World

The object returned by `createReactAPI` includes a `world` property containing the actual ECS world. You can interact with it like you would usually do to imperatively create, modify and destroy entities:

```ts
const entity = ECS.world.add({ position: { x: 0, y: 0 } })
```

For more details on how to interact with the ECS world, please refer to the [miniplex] core package's documentation.

### Describing Entities and Components

As a first step, let's add a single entity to your React application. We use `<Entity>` to declare the entity, and `<Component>` to add components to it.

```tsx
import { ECS } from "./state"

const Player = () => (
  <ECS.Entity>
    <ECS.Component name="position" data={{ x: 0, y: 0, z: 0 }} />
    <ECS.Component name="health" data={100} />
  </ECS.Entity>
)
```

This will, once mounted, create a single entity in your ECS world, and add the `position` and `health` components to it. Once unmounted, it will also automatically destroy the entity.

### Capturing object refs into components

If your components are designed to store rich objects, and these can be expressed as React components providing Refs, you can pass a single React child to `<Component>`, and its Ref value will automatically be picked up. For example, let's imagine a react-three-fiber based game that allows entities to have a scene object stored on the `three` component:

```tsx
import { ECS } from "./state"

const Player = () => (
  <ECS.Entity>
    <ECS.Component name="position" data={{ x: 0, y: 0, z: 0 }} />
    <ECS.Component name="health" data={100} />
    <ECS.Component name="three">
      <mesh>
        <sphereGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </ECS.Component>
  </ECS.Entity>
)
```

Now the player's `three` component will be set to a reference to the Three.js scene object created by the `<mesh>` element.

### Enhancing existing entities

`<Entity>` can also represent _previously created_ entities, which can be used to enhance them with additional components. This is useful if your entities are created somewhere else, but at the time when they are rendered, you still need to enhance them with additional components. For example:

```tsx
import { ECS } from "./state"

const Game = () => {
  const [player] = useState(() =>
    ECS.world.add({
      position: { x: 0, y: 0, z: 0 },
      health: 100
    })
  )

  return (
    <>
      {/* All sorts of stuff */}
      <RenderPlayer player={player} />
      {/* More stuff */}
    </>
  )
}

const RenderPlayer = ({ player }) => (
  <ECS.Entity entity={player}>
    <ECS.Component name="three">
      <mesh>
        <sphereGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </ECS.Component>
  </ECS.Entity>
)
```

When `<Entity>` is used to represent and enhance an existing entity, the entity will _not_ be destroyed once the component is unmounted.

### `<Entities>` and `useEntities`

Eventually you'll write a React component that needs to operate on entities of a specific type.

In Miniplex, you create _queries_ that automatically get updated whenever entities matching their criteria are added or removed from the world. The `useEntities` hook provided by this package is a React hook that subscribes to a query and returns the list of entities matching it; it also makes sure that the component is re-rendered whenever entities are added to or removed from the query.

A typical use case is a React component that renders JSX for every entity of a specific type:

```tsx
import { useEntities } from "miniplex-react"
import { ECS } from "./state"
import { AsteroidModel } from "./models"

const asterois = ECS.world.with("isAsteroid")

const Asteroids = () => {
  const { entities } = useEntities(asteroids)

  return (
    <Entities in={entities}>
      <ECS.Component name="three">
        <AsteroidModel />
      </ECS.Component>
    </Entities>
  )
}
```

You can also use this to write React components that implement systems this way:

```tsx
import { useEntities } from "miniplex-react"
import { useFrame } from "@react-three/fiber"
import { ECS } from "./state"

const movingEntities = ECS.world.with("position", "velocity")

const MovementSystem = () => {
  const { entities } = useEntities(movingEntities)

  /*
  In this example, We're using react-three-fiber's useFrame to mount a function that runs every frame. What you will use in your project depends on the framework you're using.
  */
  useFrame((_, dt) => {
    for (const entity of entities) {
      entity.position.x += entity.velocity.x * dt
      entity.position.y += entity.velocity.y * dt
      entity.position.z += entity.velocity.z * dt
    }
  })

  return null
}
```

### Using Render Props

`<Entity>` and `<Entities>` support the optional use of [children render props](https://reactjs.org/docs/render-props.html), where instead of JSX children, you pass a _function_ that receives each entity as its first and only argument, and is expected to _return_ the JSX that is to be rendered. This is useful if you're rendering a collection of entities and need access to their data, or need some code to run _for each entity_, for example when setting random values like in this example:

```tsx
const enemies = ECS.world.with("enemy")

const EnemyShips = () => (
  <ECS.Entities in={enemies}>
    {(entity) => (
      <ECS.Entity entity={entity}>
        {/* Randomize the value of the health component */}
        <ECS.Component name="health" data={Math.random() * 1000}>

        <ECS.Component name="three">
          <EnemyShipModel />
        </ECS.Component>
      </ECS.Entity>
    )}
  </ECS.Entities>
)
```

### Hooking into the current entities

When you're composing entities from nested components, you may need to get the current entity context the React component is in. You can do this using the `useCurrentEntity` hook:

```tsx
const Health = () => {
  const entity = ECS.useCurrentEntity()

  useEffect(() => {
    /* Do something with the entity here */
  })

  return null
}
```

## Recommended Patterns and Best Practices

### Write imperative code for mutating the world

_TODO_

### Consider using JSX components

_TODO_

## Questions?

If you have questions about this package, you're invited to post them in our [Discussions section](https://github.com/hmans/miniplex/discussions) on GitHub.

[miniplex]: https://github.com/hmans/miniplex

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
