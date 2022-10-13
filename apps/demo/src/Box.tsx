import { GroupProps } from "@react-three/fiber"
import { DoubleSide } from "three"
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
          <mesh receiveShadow>
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
