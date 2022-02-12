# miniplex

A joyfully minimal riff on ECS with a focus on Developer Experience.

### tl;dr

**Optional, but recommended:** Define a type (or interface) that describes your entities:

```ts
type Entity = {
  position?: { x: number; y: number; z: number }
  velocity?: { x: number; y: number; z: number }
} & IEntity
```

Create a world:

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

### TODO

- [x] Draw the owl
- [ ] Document the owl, explain the owl, make the world cherish the owl, explain why the owl is needed, and why among owls, it is king
