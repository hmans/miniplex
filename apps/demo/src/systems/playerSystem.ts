import { useFrame } from "@react-three/fiber"
import { Bucket, WithRequiredKeys } from "miniplex"
import { Vector3 } from "three"
import { moveSyntheticComments } from "typescript"
import { spawnBullet } from "../entities/Bullets"
import { ECS, Entity } from "../state"
import { useKeyboard } from "../util/useKeyboard"

const tmpVec3 = new Vector3()

const players = ECS.world.archetype("isPlayer") as Bucket<
  WithRequiredKeys<Entity, "transform" | "physics">
>
const mouseInputs = ECS.world.archetype("mouseInput")

let lastFireTime = 0

export const PlayerSystem = () => {
  const keyboard = useKeyboard()

  useFrame(({ camera }, dt) => {
    const [player] = players
    const [{ mouseInput }] = mouseInputs

    if (!player || !mouseInput) return

    const input = {
      thrust: keyboard.getAxis("KeyS", "KeyW"),
      rotate: keyboard.getAxis("KeyA", "KeyD"),
      fire: keyboard.getKey("Space")
    }

    /* Orient ship towards mouseInput.point */
    const forwardAxis = new Vector3(0, 1, 0)
    const direction = mouseInput.point.clone().normalize()
    player.transform.quaternion.setFromUnitVectors(forwardAxis, direction)

    if (input.thrust) {
      tmpVec3
        .set(0, input.thrust * 20, 0)
        .applyQuaternion(player.transform.quaternion)

      player.physics.velocity.addScaledVector(tmpVec3, dt)
      player.physics.sleeping = false
    }

    if (input.rotate) {
      player.physics.angularVelocity.z -= input.rotate * 10 * dt
      player.physics.sleeping = false
    }

    if (input.fire && performance.now() > lastFireTime + 65) {
      lastFireTime = performance.now()
      spawnBullet()
    }
  })

  return null
}
