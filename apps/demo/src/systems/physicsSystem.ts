import { ECS } from "../state"

const entities = ECS.world.archetype("transform", "physics")

export function physicsSystem(dt: number) {
  for (const { transform, physics } of entities) {
    /* Apply gravity */
    physics.velocity.y -= 9.8 * dt

    /* Apply velocity */
    transform.position.addScaledVector(physics.velocity, dt)
  }
}
