import { Instance, Instances } from "@react-three/drei"
import { useEntities } from "miniplex-react"
import { Vector3 } from "three"
import { ECS } from "./state"
import { useFrame } from "@react-three/fiber"
import { SpatialHashMap } from "./systems/SpatialHashingSystem"

const boids = ECS.world.with("boid", "jsx")

export default function Boids() {
  return (
    <Instances>
      <icosahedronGeometry />
      <meshStandardMaterial color="hotpink" />

      <ECS.Entities in={boids} children={(e) => e.jsx} />
    </Instances>
  )
}

const boidsSpatialHashMap = new SpatialHashMap(2)

export const spawnBoid = ({
  position,
  velocity = new Vector3()
}: {
  position: Vector3
  velocity?: Vector3
}) => {
  ECS.world.add({
    boid: true,
    velocity,
    neighbors: [],
    spatialHashMap: boidsSpatialHashMap,
    forces: {
      coherence: new Vector3(),
      separation: new Vector3(),
      alignment: new Vector3(),
      avoidEdges: new Vector3()
    },
    jsx: (
      <ECS.Component name="transform">
        <Instance position={position} scale={0.5} />
      </ECS.Component>
    )
  })
}
