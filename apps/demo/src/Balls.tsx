import { GroupProps } from "@react-three/fiber"
import { Vector3 } from "three"
import { InstancedParticles, Particle } from "vfx-composer-r3f"
import { ECS } from "./state"

export const Balls = () => {
  return (
    <InstancedParticles castShadow receiveShadow>
      <sphereGeometry args={[0.5, 12, 12]} />
      <meshStandardMaterial color="hotpink" />

      <ECS.Archetype properties="isBall">
        {(entity) => entity.jsx}
      </ECS.Archetype>
    </InstancedParticles>
  )
}

export const spawnBall = (props: GroupProps) =>
  ECS.world.add({
    isBall: true,

    physics: {
      velocity: new Vector3(),
      mass: 1,
      radius: 0.5,
      restitution: 0.7
    },

    jsx: (
      <ECS.Property name="transform">
        <group {...props}>
          <Particle />
        </group>
      </ECS.Property>
    )
  })
