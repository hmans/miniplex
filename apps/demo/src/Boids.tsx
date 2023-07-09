import { Instance, InstanceProps, Instances } from "@react-three/drei"
import { useEntities } from "miniplex/react"
import { JSXEntity } from "./JSXEntity"
import { ECS } from "./state"

const asteroids = ECS.world.with("boid", "jsx")

export default function Boids() {
  const { entities } = useEntities(asteroids)

  return (
    <Instances>
      <icosahedronGeometry />
      <meshStandardMaterial color="hotpink" />

      <ECS.Entities in={entities} children={JSXEntity} />
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
