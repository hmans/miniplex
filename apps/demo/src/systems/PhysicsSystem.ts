import { useFrame } from "@react-three/fiber"
import { With } from "miniplex"
import { MathUtils, Vector3 } from "three"
import { ECS, Entity } from "../state"

export type PhysicsData = {
  velocity: Vector3
  angularVelocity: Vector3
  linearDamping: number
  angularDamping: number
  mass: number
  radius: number
  restitution: number
  groupMask: number
  sleeping: boolean
  collisionMask: number
  contacts: Set<Entity>
  onContactStart?: (other: Entity, force: number) => void
  onContactEnd?: (other: Entity) => void
}

type PhysicsEntity = With<Entity, "transform" | "physics">

const entities = ECS.world.with("transform", "physics")

export const PhysicsSystem = () => {
  useFrame((_, dt) => physicsSystem(entities, MathUtils.clamp(dt, 0, 0.2)))
  return null
}

export function physicsSystem(entities: Iterable<PhysicsEntity>, dt: number) {
  /* Clamp the time step to 200ms for those pesky situations where the user
  reactivates a long-suspended browser tab. */
  const step = MathUtils.clamp(dt, 0, 0.2)

  for (const entity of entities) {
    /* Make sure automatic matrix transforms are disabled */
    entity.transform.matrixAutoUpdate = false

    /* Skip if sleeping */
    if (entity.physics.sleeping) continue

    const { transform, physics } = entity

    /* Apply velocity */
    transform.position.addScaledVector(physics.velocity, step)

    /* Apply angular velocity */
    transform.rotation.x += physics.angularVelocity.x * step
    transform.rotation.y += physics.angularVelocity.y * step
    transform.rotation.z += physics.angularVelocity.z * step

    /* Apply damping */
    physics.velocity.multiplyScalar(1 - physics.linearDamping)
    physics.angularVelocity.multiplyScalar(1 - physics.angularDamping)

    /* Ball collisions */
    if (entity.neighbors) {
      for (const neighbor of entity.neighbors) {
        if (!neighbor.physics) continue
        if (!neighbor.transform) continue
        if (neighbor === entity) continue
        handleBallCollision(entity, neighbor as PhysicsEntity)
      }
    }

    /* Update matrix */
    transform.updateMatrix()

    /* Go to sleep if we're not moving */
    if (
      physics.velocity.length() < 0.001 &&
      physics.angularVelocity.length() < 0.001
    ) {
      physics.sleeping = true
    }
  }
}

const tmpVec3 = new Vector3()

function handleBallCollision(a: PhysicsEntity, b: PhysicsEntity) {
  /* Check groups and masks */
  if (!(a.physics.groupMask & b.physics.collisionMask)) return
  if (!(b.physics.groupMask & a.physics.collisionMask)) return

  /* Check distance */
  const diff = tmpVec3.subVectors(a.transform.position, b.transform.position)
  const distance = diff.length()
  const penetration = (a.physics.radius + b.physics.radius - distance) / 2.0

  if (penetration > 0) {
    /* Wake up both bodies */
    a.physics.sleeping = false
    b.physics.sleeping = false

    /* Resolve collision */
    const normal = diff.normalize()

    /* Shift objects */
    a.transform.position.addScaledVector(normal, penetration)
    b.transform.position.addScaledVector(normal, -penetration)

    /* Adjust velocities */
    const aVel = a.physics.velocity.dot(normal)
    const bVel = b.physics.velocity.dot(normal)

    const aMass = a.physics.mass
    const bMass = b.physics.mass

    const aNewVel =
      (aVel * (aMass - bMass) + 2 * bMass * bVel) / (aMass + bMass)
    const bNewVel =
      (bVel * (bMass - aMass) + 2 * aMass * aVel) / (aMass + bMass)

    a.physics.velocity.addScaledVector(normal, aNewVel - aVel)
    b.physics.velocity.addScaledVector(normal, bNewVel - bVel)

    /* Calculate collision force magnitude */
    const force = Math.abs(aNewVel - bNewVel) * (aMass + bMass)

    /* Call collision callbacks */
    if (!a.physics.contacts.has(b)) {
      a.physics.contacts.add(b)
      a.physics.onContactStart?.(b, force)
    }

    if (!b.physics.contacts.has(a)) {
      b.physics.contacts.add(a)
      b.physics.onContactStart?.(a, force)
    }
  } else {
    /* Remove stale contacts */
    a.physics.contacts.delete(b)
    a.physics.onContactEnd?.(b)
    b.physics.contacts.delete(a)
    b.physics.onContactEnd?.(a)
  }
}

/* A constructor for physics data. */
export const physics = (
  input: Partial<Entity["physics"]> = {}
): Entity["physics"] => ({
  sleeping: false,
  velocity: new Vector3(0, 0, 0),
  angularVelocity: new Vector3(0, 0, 0),

  linearDamping: 0,
  angularDamping: 0,

  mass: 1,
  radius: 1,

  restitution: 0.5,

  groupMask: 0b1111_1111_1111_1111,
  collisionMask: 0b1111_1111_1111_1111,

  contacts: new Set(),
  ...input
})
