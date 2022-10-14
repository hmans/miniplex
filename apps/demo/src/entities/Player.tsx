import { ECS, physics } from "../state"

export const Player = () => {
  return (
    <ECS.Entity>
      <ECS.Property name="physics" value={physics()} />
      <ECS.Property name="transform">
        <mesh>
          <coneGeometry args={[0.5, 1]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      </ECS.Property>
    </ECS.Entity>
  )
}
