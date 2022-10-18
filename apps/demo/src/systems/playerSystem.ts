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

  useFrame(({ camera, mouse }, dt) => {
    const [player] = players
    const [{ mouseInput }] = mouseInputs

    if (!player || !mouseInput) return

    /* Orient ship towards mouseInput.point */
    const forwardAxis = new Vector3(0, 1, 0)
    const direction = mouseInput.point
      .clone()
      .sub(player.transform.position)
      .setZ(0)
      .normalize()
    player.transform.quaternion.setFromUnitVectors(forwardAxis, direction)

    if (mouseInput.rightButton) {
      tmpVec3.set(0, 20, 0).applyQuaternion(player.transform.quaternion)

      player.physics.velocity.addScaledVector(tmpVec3, dt)
      player.physics.sleeping = false
    }

    if (mouseInput.leftButton && performance.now() > lastFireTime + 65) {
      lastFireTime = performance.now()
      spawnBullet()
    }
  })

  return null
}
