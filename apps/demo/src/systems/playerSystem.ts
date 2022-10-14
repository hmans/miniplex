import { useFrame } from "@react-three/fiber"
import { Vector3 } from "three"
import { isPlayer } from "../entities/Player"
import { ECS } from "../state"
import { useKeyboard } from "../util/useKeyboard"

const tmpVec3 = new Vector3()

const players = ECS.world.derive(isPlayer)

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
  })

  return null
}
