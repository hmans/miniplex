import { EntityWith } from "miniplex"
import { Quaternion, Vector3 } from "three"
import { BOUNDS, ECS, Entity } from "../state"

const { entities } = ECS.world.archetype("transform", "physics")

const cubes = ECS.world.archetype("isCube")

const gravity = new Vector3(0, -20, 0)

const tmpVec3 = new Vector3()
const tmpQuat = new Quaternion()

export function physicsSystem(dt: number) {
  /* Determine gravity */
  gravity.set(0, -20, 0)

  const [cube] = cubes
  tmpQuat.copy(cube.transform!.quaternion).invert()
  gravity.applyQuaternion(cube.transform!.quaternion)

  for (let i = 0; i < entities.length; i++) {
    const { transform, physics } = entities[i]

    /* Apply gravity */
    physics.velocity.addScaledVector(gravity, dt)

    /* Apply velocity */
    transform.position.addScaledVector(physics.velocity, dt)

    /* Check bounds collision */
    const B = BOUNDS - physics.radius
    if (transform.position.y < -B) {
      transform.position.y = -B
      physics.velocity.y *= -physics.restitution
    }

    if (transform.position.y > B) {
      transform.position.y = B
      physics.velocity.y *= -physics.restitution
    }

    if (transform.position.x < -B) {
      transform.position.x = -B
      physics.velocity.x *= -physics.restitution
    }

    if (transform.position.x > B) {
      transform.position.x = B
      physics.velocity.x *= -physics.restitution
    }

    if (transform.position.z < -B) {
      transform.position.z = -B
      physics.velocity.z *= -physics.restitution
    }

    if (transform.position.z > B) {
      transform.position.z = B
      physics.velocity.z *= -physics.restitution
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
