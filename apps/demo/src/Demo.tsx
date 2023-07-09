import { Canvas } from "@react-three/fiber"

function Demo() {
  return (
    <Canvas>
      <mesh>
        <icosahedronGeometry />
        <meshBasicMaterial color="hotpink" />
      </mesh>
    </Canvas>
  )
}

export default Demo
