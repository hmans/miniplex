import { GroupProps } from "@react-three/fiber"
import { DoubleSide } from "three"
import { BOUNDS, ECS } from "./state"

export const Box = ({ children, ...props }: GroupProps) => {
  return (
    <ECS.Entity>
      <ECS.Property name="isCube" value={true} />
      <ECS.Property name="transform">
        <group {...props}>
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
        </group>
      </ECS.Property>
    </ECS.Entity>
  )
}
