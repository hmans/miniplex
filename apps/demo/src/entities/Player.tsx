import { ECS, PhysicsLayers } from "../state"
import { physics } from "../systems/PhysicsSystem"
import { bitmask } from "../util/bitmask"

export const Player = () => {
  return (
    <ECS.Entity>
      <ECS.Component name="isPlayer" data={true} />
      <ECS.Component
        name="physics"
        data={physics({
          radius: 0.3,
          mass: 10,
          linearDamping: 0.02,
          angularDamping: 0.02,
          groupMask: bitmask(PhysicsLayers.Player),
          collisionMask: bitmask([PhysicsLayers.Asteroid])
        })}
      />
      <ECS.Component name="spatialHashing" data={true} />
      <ECS.Component name="neighbors" data={[]} />
      <ECS.Component name="transform">
        <mesh>
          <coneGeometry args={[0.5, 1]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      </ECS.Component>
    </ECS.Entity>
  )
}
