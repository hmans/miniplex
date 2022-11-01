import { useFrame } from "@react-three/fiber"
import { Vector3 } from "three"
import { ECS } from "../state"

const bodyTarget = new Vector3()
const lookTarget = new Vector3()

const players = ECS.world.archetype("isPlayer", "transform")
const cameras = ECS.world.archetype("isCamera", "transform")

export const CameraRigSystem = ({
  offset = new Vector3()
}: {
  offset?: Vector3
}) => {
  useFrame((_, dt) => {
    const [player] = players
    const [camera] = cameras

    if (!player || !camera) return

    bodyTarget.copy(player.transform.position).add(offset)
    lookTarget.copy(camera.transform.position).sub(offset)

    camera.transform.position.lerp(bodyTarget, dt * 2)
    camera.transform.lookAt(lookTarget)
  })

  return null
}
