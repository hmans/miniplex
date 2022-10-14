import { WithRequiredKeys } from "miniplex"
import { ECS, Entity, physics } from "../state"

export type Player = WithRequiredKeys<
  Entity,
  | "isPlayer"
  | "transform"
  | "physics"
  | "spatialHashing"
  | "neighbors"
  | "transform"
>

export const isPlayer = (entity: Entity): entity is Player =>
  "isPlayer" in entity

export const Player = () => {
  return (
    <ECS.Entity>
      <ECS.Property name="isPlayer" value={true} />
      <ECS.Property name="physics" value={physics({ radius: 0.3, mass: 10 })} />
      <ECS.Property name="spatialHashing" value={{}} />
      <ECS.Property name="neighbors" value={[]} />
      <ECS.Property name="transform">
        <mesh>
          <coneGeometry args={[0.5, 1]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      </ECS.Property>
    </ECS.Entity>
  )
}
