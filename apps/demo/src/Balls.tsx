import { between } from "randomish"
import { Vector3 } from "three"
import { InstancedParticles, Particle, ParticleProps } from "vfx-composer-r3f"
import { ECS } from "./state"

export const Balls = () => (
  <InstancedParticles castShadow receiveShadow>
    <sphereGeometry args={[1, 12, 12]} />
    <meshStandardMaterial color="#f1faee" />

    <ECS.Archetype properties="isBall">{(entity) => entity.jsx}</ECS.Archetype>
  </InstancedParticles>
)

export const spawnBall = (props: ParticleProps) => {
  const radius = between(0.2, 0.4)

  return ECS.world.add({
    isBall: true,

    physics: {
      velocity: new Vector3(),
      mass: 1,
      radius,
      restitution: 0.8 - radius
    },

    spatialHashing: {},

    neighbors: new Set(),

    jsx: (
      <ECS.Property name="transform">
        <Particle scale={radius} {...props} />
      </ECS.Property>
    )
  })
}
