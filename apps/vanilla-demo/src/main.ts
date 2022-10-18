import { insideSphere, plusMinus } from "randomish"
import * as THREE from "three"
import { AmbientLight, InstancedMesh, Vector3 } from "three"
import "./style.css"
import * as engine from "./systems/engine"

engine.start((world, _runner) => {
  /* Add some lights */
  world.add({ transform: new AmbientLight("orange", 0.2) })
  const light = world.add({ transform: new THREE.DirectionalLight() })
  light.transform.position.set(10, 20, 30)

  /* Add an instanced mesh */
  const imesh = world.add({
    transform: new InstancedMesh(
      new THREE.IcosahedronGeometry(),
      new THREE.MeshStandardMaterial(),
      1000
    ),
    autorotate: new Vector3(0.01, 0.02, 0.03)
  })

  /* Add a few instances */
  for (let i = 0; i < 1000; i++) {
    const pos = insideSphere(20)

    const entity = world.add({
      transform: new THREE.Object3D(),
      instance: { imesh: imesh.transform },
      parent: imesh,
      autorotate: new Vector3(plusMinus(1), plusMinus(1), plusMinus(1))
    })

    entity.transform.position.set(pos.x, pos.y, pos.z)
  }
})
