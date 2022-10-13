import { GroupProps } from "@react-three/fiber"
import { between } from "randomish"
import { Vector3 } from "three"
import { InstancedParticles, Particle } from "vfx-composer-r3f"
import { ECS } from "./state"

export const Balls = () => {
  return (
    <InstancedParticles castShadow receiveShadow>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial color="#f1faee" />

      <ECS.Archetype properties="isBall">
        {(entity) => entity.jsx}
      </ECS.Archetype>
    </InstancedParticles>
  )
}

export const spawnBall = (props: GroupProps) => {
  const radius = between(0.1, 0.3)

  return ECS.world.add({
    isBall: true,

    physics: {
      velocity: new Vector3(),
      mass: 1,
      radius,
      restitution: 0.8 - radius
    },

    jsx: (
      <ECS.Property name="transform">
        <group {...props}>
          <Particle scale={radius} />
        </group>
      </ECS.Property>
    )
  })
}
