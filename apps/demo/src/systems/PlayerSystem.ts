import { useFrame } from "@react-three/fiber"
import { With, WithOnly } from "miniplex"
import { Vector3 } from "three"
import { spawnBullet } from "../entities/Bullets"
import { ECS, Entity } from "../state"
import { useKeyboard } from "../util/useKeyboard"

const tmpVec3 = new Vector3()

/* Create a type specifically for our player entity. */
export type Player = With<Entity, "isPlayer" | "transform" | "physics">
export type PlayerOnly = WithOnly<Player, "isPlayer" | "transform" | "physics">

/* Create a predicate that narrows the type to the above. */
export const isPlayer = (entity: Entity): entity is Player => !!entity.isPlayer

/* Create a bucket. Its entities will be typed as `Player`. */
const players = ECS.world.where(isPlayer)

let lastFireTime = 0

export const PlayerSystem = () => {
  const keyboard = useKeyboard()

  useFrame((_, dt) => {
    const [player] = players
    if (!player) return

    const input = {
      thrust: keyboard.getAxis("KeyS", "KeyW"),
      rotate: keyboard.getAxis("KeyA", "KeyD"),
      fire: keyboard.getKey("Space")
    }

    /* Forward thrust */
    if (input.thrust) {
      tmpVec3
        .set(0, input.thrust * 20, 0)
        .applyQuaternion(player.transform.quaternion)

      player.physics.velocity.addScaledVector(tmpVec3, dt)
      player.physics.sleeping = false
    }

    /* Rotation */
    if (input.rotate) {
      player.physics.angularVelocity.z -= input.rotate * 10 * dt
      player.physics.sleeping = false
    }

    /* Firing */
    const now = performance.now()
    if (input.fire && now > lastFireTime + 65) {
      lastFireTime = now
      spawnBullet()
    }
  })

  return null
}
