import { EntityWith } from "miniplex"
import { Vector3 } from "three"
import { BOUNDS, ECS, Entity } from "../state"

const { entities } = ECS.world.archetype("transform", "physics")

const gravity = new Vector3(0, -20, 0)

const tmpVec3 = new Vector3()

export function physicsSystem(dt: number) {
  for (let i = 0; i < entities.length; i++) {
    const { transform, physics } = entities[i]

    /* Apply gravity */
    physics.velocity.addScaledVector(gravity, dt)

    /* Apply velocity */
    transform.position.addScaledVector(physics.velocity, dt)

    /* Check bounds collision */
    if (transform.position.y < -BOUNDS) {
      transform.position.y = -BOUNDS
      physics.velocity.y *= -physics.restitution
    }

    /* Ball collisions */
    for (let j = i + 1; j < entities.length; j++) {
      handleBallCollision(entities[i], entities[j])
    }
  }
}

function handleBallCollision(
  a: EntityWith<Entity, "transform" | "physics">,
  b: EntityWith<Entity, "transform" | "physics">
) {
  const diff = tmpVec3.subVectors(a.transform.position, b.transform.position)
  const distance = diff.length()
  const penetration = (a.physics.radius + b.physics.radius - distance) / 2.0

  if (penetration <= 0) return

  const normal = diff.normalize()

  /* Shift objects */
  a.transform.position.addScaledVector(normal, penetration)
  b.transform.position.addScaledVector(normal, -penetration)

  /* Adjust velocities */
  const aVel = a.physics.velocity.dot(normal)
  const bVel = b.physics.velocity.dot(normal)

  const aMass = a.physics.mass
  const bMass = b.physics.mass

  const aNewVel = (aVel * (aMass - bMass) + 2 * bMass * bVel) / (aMass + bMass)
  const bNewVel = (bVel * (bMass - aMass) + 2 * aMass * aVel) / (aMass + bMass)

  a.physics.velocity.addScaledVector(normal, aNewVel - aVel)
  b.physics.velocity.addScaledVector(normal, bNewVel - bVel)
}
