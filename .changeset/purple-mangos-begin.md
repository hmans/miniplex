---
"miniplex": patch
---

`createEntity` now allows you to pass multiple parameters, each representing a partial entity. This makes the use of component factory functions more convenient. Example:

```ts
/* Define component types */
type Vector2 = { x: number; y: number }
type PositionComponent = { position: Vector2 }
type VelocityComponent = { velocity: Vector2 }
type HealthComponent = { health: { max: number; current: number } }

/* Define an entity type composed of required and optional components */
type Entity = PositionComponent & Partial<VelocityComponent, HealthComponent>

/* Provide a bunch of component factories */
const position = (x = 0, y = 0): PositionComponent => ({ position: { x, y } })
const velocity = (x = 0, y = 0): VelocityComponent => ({ velocity: { x, y } })
const health = (initial: number): HealthComponent => ({
  health: { max: initial, current: initial }
})

const world = new World<Entity>()

const entity = world.createEntity(position(0, 0), velocity(5, 7), health(1000))
```

**Typescript Note:** The first argument will always be typechecked against your entity type, so if your entity type has required components, you will need to pass a first argument that satisfies these. The remaining arguments are expected to be partials of your entity type.
