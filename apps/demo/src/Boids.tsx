import { Instance, Instances } from "@react-three/drei"
import { useEntities } from "miniplex-react"
import { Vector3 } from "three"
import { ECS } from "./state"

const boids = ECS.world.with("boid", "jsx")

export default function Boids() {
  const { entities } = useEntities(boids)

  return (
    <Instances>
      <icosahedronGeometry />
      <meshStandardMaterial color="hotpink" />

      <ECS.Entities in={entities} children={(e) => e.jsx} />
    </Instances>
  )
}

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
    forces: {
      coherence: new Vector3(),
      separation: new Vector3(),
      alignment: new Vector3()
    },
    jsx: (
      <ECS.Component name="transform">
        <Instance position={position} />
      </ECS.Component>
    )
  })
}
