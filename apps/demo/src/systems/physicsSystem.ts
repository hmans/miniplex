import { Vector3 } from "three"
import { BOUNDS, ECS } from "../state"

const entities = ECS.world.archetype("transform", "physics")

const gravity = new Vector3(0, -20, 0)

export function physicsSystem(dt: number) {
  for (const { transform, physics } of entities) {
    /* Apply gravity */
    physics.velocity.addScaledVector(gravity, dt)

    /* Apply velocity */
    transform.position.addScaledVector(physics.velocity, dt)

    /* Check bounds collision */
    if (transform.position.y < -BOUNDS) {
      transform.position.y = -BOUNDS
      physics.velocity.y *= -physics.restitution
    }
  }
}
