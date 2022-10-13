import { GroupProps } from "@react-three/fiber"
import { DoubleSide, Vector3 } from "three"
import { BOUNDS, ECS } from "./state"
import { Animate } from "@hmans/r3f-animate"

export const Box = ({ children, ...props }: GroupProps) => {
  return (
    <ECS.Entity>
      <ECS.Property name="isCube" value={true} />
      <ECS.Property name="transform">
        <Animate
          {...props}
          fun={(g, dt) => {
            g.rotation.z += dt * 0.3
            g.rotation.x += dt * 0.1
          }}
        >
          <mesh receiveShadow onClick={() => bounce()}>
            <boxGeometry args={[BOUNDS * 2, BOUNDS * 2, BOUNDS * 2]} />
            <meshPhysicalMaterial
              color="#eee"
              transparent
              opacity={0.3}
              side={DoubleSide}
            />
          </mesh>

          {children}
        </Animate>
      </ECS.Property>
    </ECS.Entity>
  )
}

const bounce = () => {
  const [cube] = ECS.world.archetype("isCube")
  if (!cube) return

  for (const { physics } of ECS.world.archetype("physics")) {
    physics.velocity.add(
      new Vector3(0, 10, 0).applyQuaternion(cube.transform!.quaternion.invert())
    )
  }
}
