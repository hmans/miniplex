import { useFrame } from "@react-three/fiber"
import { WithRequiredKeys } from "miniplex"
import { Vector3 } from "three"
import { spawnBullet } from "../entities/Bullets"
import { ECS, Entity } from "../state"
import { useKeyboard } from "../util/useKeyboard"

const tmpVec3 = new Vector3()

const isPlayer = (
  entity: Entity
): entity is WithRequiredKeys<Entity, "transform" | "physics"> =>
  !!entity.isPlayer

const players = ECS.world.derive(isPlayer)

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

    if (input.thrust) {
      tmpVec3
        .set(0, input.thrust * 20, 0)
        .applyQuaternion(player.transform.quaternion)

      player.physics.velocity.addScaledVector(tmpVec3, dt)
    }

    if (input.rotate) {
      player.physics.angularVelocity.z -= input.rotate * 10 * dt
    }

    if (input.fire && performance.now() > lastFireTime + 65) {
      lastFireTime = performance.now()
      spawnBullet()
    }
  })

  return null
}
