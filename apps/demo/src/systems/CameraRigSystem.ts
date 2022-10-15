import { useFrame } from "@react-three/fiber"
import { Vector3 } from "three"
import { ECS } from "../state"

const bodyTarget = new Vector3()

export const CameraRigSystem = ({
  offset = new Vector3()
}: {
  offset?: Vector3
}) => {
  const [player] = ECS.useArchetype("isPlayer", "transform")
  const [camera] = ECS.useArchetype("isCamera", "transform")

  useFrame((_, dt) => {
    if (!player || !camera) return

    bodyTarget.copy(player.transform.position).add(offset)

    /* Zoom out based on player velocity */
    bodyTarget.z += player.physics!.velocity.length()

    camera.transform.position.lerp(bodyTarget, dt * 2)
  })

  return null
}
