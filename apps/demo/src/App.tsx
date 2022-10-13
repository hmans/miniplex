import { Canvas } from "@react-three/fiber"

function App() {
  return (
    <Canvas>
      <ambientLight />
      <directionalLight position={[10, 10, 5]} />

      <mesh>
        <icosahedronGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </Canvas>
  )
}

export default App
