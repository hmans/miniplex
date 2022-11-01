import { between } from "randomish"
import { Color, Quaternion, Vector3 } from "three"
import { InstancedParticles, Particle } from "vfx-composer-r3f"
import { applyDamage, queueDestroy } from "../actions"
import { ECS, lifetime, physics, PhysicsLayers } from "../state"
import { bitmask } from "../util/bitmask"
import { RenderableEntity } from "./RenderableEntity"

export const Bullets = () => (
  <InstancedParticles>
    <planeGeometry args={[0.15, 0.5]} />
    <meshStandardMaterial color={new Color("orange").multiplyScalar(5)} />

    <ECS.Archetype with="isBullet" as={RenderableEntity} />
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
    ...lifetime(2),

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

      onContactStart: (other) => {
        queueDestroy(bullet)
        applyDamage(other, 270)
      }
    }),

    spatialHashing: true,
    neighbors: [],

    render: (
      <ECS.Component name="transform">
        <Particle
          position={player.transform!.position}
          quaternion={player.transform!.quaternion}
        />
      </ECS.Component>
    )
  })

  return bullet
}
