import { between } from "randomish"
import { Quaternion, Vector3 } from "three"
import { InstancedParticles, Particle } from "vfx-composer-r3f"
import { ECS, lifetime, physics, PhysicsLayers } from "../state"
import { bitmask } from "../util/bitmask"
import { RenderableEntity } from "./RenderableEntity"

export const Bullets = () => (
  <InstancedParticles>
    <planeGeometry args={[0.15, 0.5]} />
    <meshStandardMaterial color="orange" />

    <ECS.Archetype properties="isBullet" as={RenderableEntity} />
  </InstancedParticles>
)

const players = ECS.world.archetype("isPlayer")

const jitter = new Quaternion()
const axisZ = new Vector3(0, 0, 1)

export const spawnBullet = () => {
  const [player] = players
  if (!player) return

  const bullet = ECS.world.add({
    isBullet: true,
    ...lifetime(1),

    physics: physics({
      velocity: new Vector3(0, 25, 0)
        .applyQuaternion(player.transform!.quaternion)
        .applyQuaternion(jitter.setFromAxisAngle(axisZ, between(-0.04, 0.04)))
        .add(player.physics!.velocity),
      radius: 0.1,
      restitution: 1,
      linearDamping: 1,
      angularDamping: 1,

      groupMask: bitmask(PhysicsLayers.Bullet),
      collisionMask: bitmask([PhysicsLayers.Asteroid]),

      onContactStart: () => {
        ECS.world.addProperty(bullet, "destroy", true)
      }
    }),

    spatialHashing: {},
    neighbors: [],

    render: (
      <ECS.Property name="transform">
        <Particle
          position={player.transform!.position}
          quaternion={player.transform!.quaternion}
        />
      </ECS.Property>
    )
  })

  return bullet
}
