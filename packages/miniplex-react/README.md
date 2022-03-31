[![Version](https://img.shields.io/npm/v/miniplex-react)](https://www.npmjs.com/package/miniplex-react)
[![Downloads](https://img.shields.io/npm/dt/miniplex-react.svg)](https://www.npmjs.com/package/miniplex-react)
[![Bundle Size](https://img.shields.io/bundlephobia/min/miniplex-react?label=bundle%20size)](https://bundlephobia.com/result?p=miniplex-react)

# miniplex-react

### React glue for [miniplex], the gentle game entity manager.

**🚨 Warning: the React glue provided by this package is still incomplete and should be considered unstable. (It works, but there will be breaking changes!)**

## Usage

The main entry point for this library is the `createECS` function, which will create a miniplex world alongside a collection of useful hooks and React components that will interact with it.

```ts
import { createECS } from "miniplex-react"
```

It is recommended that you invoke this function from a module in your application that exports the generated object, and then have the rest of your project import that module, similar to how you would provide a global store:

```js
/* state.js */
export const ECS = createECS()
```

**TypeScript note:** it is recommended that you define a type that describes the structure of your entities, and pass that to the `createECS` function. This will make sure that any and all interactions with the ECS world and the provided hooks and components have full type checking/hinting/autocomplete support:

```ts
/* state.ts */
import { createECS } from "miniplex-react"

type Entity = {
  position: { x: number; y: number; z: number }
  velocity?: { x: number; y: number; z: number }
  health?: number
} & IEntity

export const ECS = createECS<Entity>()
```

### The World

`createECS` returns a `world` property containing the actual ECS world. You can interact with it like you would usually do to imperatively create, modify and destroy entities:

```ts
const entity = ECS.world.createEntity({ position: { x: 0, y: 0 } })
```

For more details on how to interact with the ECS world, please refer to the [miniplex] documentation.

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

### Storing objects in components

If your components are designed to store rich objects, and these can be expressed as React components providing Refs, you can pass a single React child to `<Component>`, and its Ref value will automatically be picked up. For example, let's imagine a react-three-fiber based game that allows entities to have a scene object:

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

`<Entity>` can also represent _previously created_ entities, which can be used to enhance them with additional components. This is tremendously useful if your entities are created somewhere else, but at render time, you still need to enhance them with additional components. For example:

```tsx
import { ECS } from "./state"

const Game = () => {
  const [player] = useState(() =>
    ECS.world.createEntity({
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

### The useArchetype hook

Sometimes you'll write React components that need access to entities of a specific archetype, without rendering them. This is what the `useArchetype` hook is for. Similar to the `world.archetype` function provided by [miniplex], this will return the requested archetype, but it will also automatically re-render the component whenever entities are added to or removed from the archetype's entities list.

```tsx
const MovementSystem = () => {
  const { entities } = ECS.useArchetype("position", "velocity")

  /* Do something with the entities here */

  return null
}
```

### Rendering a List of Entities

The `<Entities>` React component takes a list of entities and renders them. For example, imagine a game that has spaceships which are either tagged as `enemy` or `friendly`. You may now have two separate React components subscribing to the corresponding archetype, and passing its list of entities to `<Entities>`:

```tsx
const EnemyShips = () => {
  const { entities } = ECS.useArchetype("ship", "enemy")

  return (
    <ECS.Entities entities={entities}>
      <ECS.Component name="three">
        <EnemyShipModel />
      </ECS.Component>
    </ECS.Entities>
  )
}

const FriendlyShips = () => {
  const { entities } = ECS.useArchetype("ship", "friendly")

  return (
    <ECS.Entities entities={entities}>
      <ECS.Component name="three">
        <FriendlyShipModel />
      </ECS.Component>
    </ECS.Entities>
  )
}
```

### Collections

In games and other ECS-oriented applications, you will often have several distinct _entity types_ -- like spaceships, asteroids, bullets, explosions, etc. -- even if these entities are composed of several shared ECS components. All entities within a specific entity type are typically composed from the same set of components (eg. spaceships always have a position and a velocity), and rendered in a similar manner (eg. bullets will always be rendered using a small box mesh, but with varying materials.)

The `<Collection>` React component is an abstraction over this. It will take over management and rendering of such an entity type, assuming that this type can be identified by the presence of a specific tag (a tag being a miniplex component that is always just `true` and doesn't hold any additional data; miniplex provides a `Tag` type and constant for this.)

Let's take a look at an example:

```tsx
const Asteroids = () => (
  <ECS.Collection tag="asteroid" initial={100}>
    {(entity) => (
      <>
        <ECS.Component
          name="position"
          data={{
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50,
            z: Math.random() * 100 - 50
          }}
        />

        <ECS.Component name="three">
          <AsteroidModel />
        </ECS.Component>
      </>
    )}
  </ECS.Collection>
)
```

This code will do the following:

- Create an initial set of 100 entities that have the `asteroid` tag
- Render all of these entities, using the render function passed as a child
- Reactively update when entities from this collection are added or removed outside of this component
- When unmounted, destroy all entities that have the `asteroid` tag.

A couple of important notes:

- The child does not have to be a render function, you can simply pass normal React children. We're using a render function here because we're randomizing the positions of newly spawned asteroids, and need these values to be different for every entity.
- Note how the render function is passed a reference to the current entity as its first and only argument. You can use this to access existing data on the entity when needed.
- The children of this component are automatically _memoized_, so if you've already rendered a hundred asteroids and a new asteroid is added, only that new asteroid will have the inner function executed. This is almost always what you want (because rerendering _all_ items would quickly crush performance.) Keep in mind that if any of your inner components reactively rerender based on eg. state changes, this will still work fine.

## Questions?

Find me on [Twitter](https://twitter.com/hmans) or the [Poimandres Discord](https://discord.gg/aAYjm2p7c7).

[miniplex]: https://github.com/hmans/miniplex
