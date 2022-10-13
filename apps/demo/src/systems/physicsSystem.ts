import { BOUNDS, ECS } from "../state"

const entities = ECS.world.archetype("transform", "physics")

export function physicsSystem(dt: number) {
  for (const { transform, physics } of entities) {
    /* Apply gravity */
    physics.velocity.y -= 9.8 * dt

    /* Apply velocity */
    transform.position.addScaledVector(physics.velocity, dt)

    /* Check bounds collision */
    if (transform.position.y < -BOUNDS) {
      transform.position.y = -BOUNDS
      physics.velocity.y *= -1
    }
  }
}
