# Aaaaah

```ts
import { World } from "miniplex"

/* Start with some classic "dumb" game classes: */

class Vector {
  constructor(public x = 0, public y = 0) {}
}

class Player {
  position = new Vector()
  velocity = new Vector()
  score = 0
}

class Enemy {
  position = new Vector()
  velocity = new Vector()
}

class Mine {
  position = new Vector()
}

/* OH NO, they can be composed into an entity type for a Miniplex world! */

const world = new World<Player | Enemy | Mine>()

world.add(new Player())
world.add(new Enemy())
world.add(new Mine())

/* Now we can write system code that processes them based on composition,
            not identity! */

function velocitySystem() {
  /* Update all entities with a velocity. This piece of code doesn't care what
           the rest of the entity looks like, what class it is, and what other neat things
           it can do. */
  for (const { position, velocity } of world.with("velocity")) {
    position.x += velocity.x
    position.y += velocity.y
  }
}
```
