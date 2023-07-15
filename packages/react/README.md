![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/hmans/miniplex/tests.yml?style=for-the-badge)
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

### Rendering lists of entities using `<Entities>`

The `<Entities>` component will render a list of entities. It takes a `in` prop that can be either a Miniplex query, world, or just an array of entities. It is most commonly used together with a Miniplex query:

```tsx
import { ECS } from "./state"
import { AsteroidModel } from "./models"

const asterois = ECS.world.with("isAsteroid")

const Asteroids = () => (
  <ECS.Entities in={asteroids}>
    <ECS.Component name="three">
      <AsteroidModel />
    </ECS.Component>
  </ECS.Entities>
)
```

When used this way, it will automatically re-render every time the list of entities represented by the given query changes. If for some reason you do _not_ want it to re-render in those cases, you can just pass an array of entities instead:

```tsx
import { ECS } from "./state"
import { AsteroidModel } from "./models"

const asterois = ECS.world.with("isAsteroid")

/* Note the .entities property! */
const Asteroids = () => (
  <ECS.Entities in={asteroids.entities}>
    <ECS.Component name="three">
      <AsteroidModel />
    </ECS.Component>
  </ECS.Entities>
)
```

## Using `useEntities` to react to changes

This package also provides the `useEntities` hook that will subscribe your React component to changes in a query or world and will automatically re-render it every time entities are added or removed. This can be useful for implementing side effects that need to run for one-off entities:

```tsx
const cameraTargets = ECS.world.with("cameraTarget", "object3d")

const MyCamera = () => {
  const camera = useRef<PerspectiveCamera>()

  /* Grab the first entity that matches the query */
  const [cameraTarget] = useEntities(cameraTargets)

  /* Run a side effect when the camera target changes */
  useEffect(() => {
    if (!camera.current) return
    if (!cameraTarget) return

    camera.current.lookAt(cameraTarget.object3d.position)
  }, [cameraTarget])

  return <PerspectiveCamera ref={camera} makeDefault />
}
```

### Using Render Props

`<Entity>` and `<Entities>` support the optional use of [children render props](https://reactjs.org/docs/render-props.html), where instead of JSX children, you pass a _function_ that receives each entity as its first and only argument, and is expected to _return_ the JSX that is to be rendered. This is useful if you're rendering a collection of entities and need access to their data, or need some code to run _for each entity_, for example when setting random values like in this example:

```tsx
const enemies = ECS.world.with("enemy")

const EnemyShips = () => (
  <ECS.Entities in={enemies}>
    {(entity) => {
      const health = Math.random() * 1000

      return (
        <ECS.Entity entity={entity}>
          <ECS.Component name="health" data={health} />

          <ECS.Component name="three">
            <EnemyShipModel />
          </ECS.Component>
        </ECS.Entity>
      )
    }}
  </ECS.Entities>
)
```

### Hooking into the current entities

When you're composing entities from nested components, you may need to get the current entity context the React component is in. You can do this using the `useCurrentEntity` hook:

```tsx
const Health = () => {
  /* Retrieve the entity represented by the neares `<Entity>` component */
  const entity = ECS.useCurrentEntity()

  useEffect(() => {
    /* Do something with the entity here */
  })

  return null
}
```

## Recommended Patterns and Best Practices

### Implementing Systems

Since Miniplex doesn't have any built-in notion of what a system is, their implementation is entirely left up to you. This is by design; while other ECS implementations often force their own system scheduler setup on you, Miniplex neatly snuggles into your existing codebase and lets you use it with whatever scheduling functionality the framework you're using provides.

In a react-three-fiber application, for example, you would use the `useFrame` hook to execute a system function once per frame:

```tsx
import { useEntities } from "miniplex-react"
import { useFrame } from "@react-three/fiber"
import { ECS } from "./state"

const movingEntities = ECS.world.with("position", "velocity")

const MovementSystem = () => {
  useFrame((_, dt) => {
    for (const entity of movingEntities) {
      entity.position.x += entity.velocity.x * dt
      entity.position.y += entity.velocity.y * dt
      entity.position.z += entity.velocity.z * dt
    }
  })

  return null
}
```

### Write imperative code for mutating the world

While the `<Entity>` component can be used to spawn (and later destroy) a new entity, you will typically only use this for one-off entities (like the player, or some other entity that only exists once and is expected to be managed by a React component.)

For everything else, you should write imperative code that mutates the world, and design your React components to _react_ to these changes. Consider the following module, which co-locates both an `<Enemies>` component that renders the currently active enemies, and a `spawnEnemy` function that spawns a new one:

```tsx
const enemies = ECS.world.with("enemy")

export const Enemies = () => (
  <ECS.Entities in={enemies}>
    <ECS.Component name="three">
      <EnemyShipModel />
    </ECS.Component>
  </ECS.Entities>
)

export const spawnEnemy = () =>
  ECS.world.add({
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    health: 100,
    enemy: true
  })
```

In another React component that manages your game's state, you may now use this function to spawn an initial number of enemies:

```tsx
import { spawnEnemy } from "./enemies"

export const GameState = () => {
  useEffect(() => {
    /* Initialize game state */
    for (let i = 0; i < 10; i++) {
      spawnEnemy()
    }

    /* When unmounting, reset game state */
    return () => {
      ECS.world.clear()
    }
  }, [])
}
```

### Using the `children` prop on `<Entities>`

You've already seen how the `<Entities>` component optionally accepts a render prop as its child; this can be used to defer the rendering of an entity to a separate function:

```tsx
const enemies = ECS.world.with("enemy")

export const Enemies = () => <ECS.Entities in={enemies} children={Enemy} />

export const Enemy = (entity) => (
  <ECS.Entity entity={entity}>
    <ECS.Component name="three">
      <EnemyShipModel />
    </ECS.Component>
  </ECS.Entity>
)
```

This is particularly useful if you want to provide a component that renders out a single entity of a specific type, and then want to re-use it when rendering a complete list of them. The `<Enemies>` component above is functionally equivalent to:

```tsx
export const Enemies = () => (
  <ECS.Entities in={enemies}>{(entity) => <Enemy {...entity} />}</ECS.Entities>
)
```

Or event this, since React components are just functions:

```tsx
export const Enemies = () => <ECS.Entities in={enemies}>{Enemy}</ECS.Entities>
```

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

```

```
