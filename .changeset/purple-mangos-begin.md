---
"miniplex": patch
---

`createEntity` now allows you to pass multiple parameters, each representing a partial entity. This makes the use of component factory functions more convenient. Example:

```ts
type GameObject = {
  position: Vector2
  velocity?: Vector2
}

const position = (x = 0, y = 0) => ({ position: { x, y } })
const velocity = (x = 0, y = 0) => ({ velocity: { x, y } })

const world = new World<GameObject>()

const entity = world.createEntity(position(0, 0), velocity(5, 7))
```
