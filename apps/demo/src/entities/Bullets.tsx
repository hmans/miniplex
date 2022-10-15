import { Vector3 } from "three"
import { InstancedParticles, Particle, ParticleProps } from "vfx-composer-r3f"
import { ECS, physics } from "../state"
import { RenderableEntity } from "./RenderableEntity"

export const Bullets = () => (
  <InstancedParticles>
    <planeGeometry args={[0.1, 0.1]} />
    <meshStandardMaterial color="yellow" />

    <ECS.Archetype properties="isBullet" as={RenderableEntity} />
  </InstancedParticles>
)

export const spawnBullet = (props: ParticleProps) => {
  const bullet = ECS.world.add({
    isBullet: true,

    physics: physics({
      velocity: new Vector3(0, 1, 0),
      radius: 0.1,
      restitution: 0,
      linearDamping: 1,
      angularDamping: 1
    }),

    spatialHashing: {},
    neighbors: [],

    render: (
      <ECS.Property name="transform">
        <Particle {...props} />
      </ECS.Property>
    )
  })

  return bullet
}
