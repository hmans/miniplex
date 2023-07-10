import { Instance, InstanceProps, Instances } from "@react-three/drei"
import { useEntities } from "miniplex-react"
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

export const spawnBoid = (props: InstanceProps) =>
  ECS.world.add({
    boid: true,
    jsx: (
      <ECS.Component name="object3d">
        <Instance {...props} />
      </ECS.Component>
    )
  })
