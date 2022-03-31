---
"miniplex": patch
---

Change the API signature of `addComponent` to expect a partial entity instead of name and value, to provide a better interface for component factories:

```ts
const position = (x: number = 0, y: number = 0) => ({ position: { x, y } })
const health = (amount: number) => ({ health: { max: amount, current: amount } })

world.addComponent(entity, { ...position(), ...health(100) })
```
