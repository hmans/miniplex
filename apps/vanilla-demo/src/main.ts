import * as THREE from "three"
import { AmbientLight, Vector3 } from "three"
import "./style.css"
import * as engine from "./systems/engine"

engine.start((world, _runner) => {
  /* Add some lights */
  world.add({ transform: new AmbientLight("orange", 0.2) })
  const light = world.add({ transform: new THREE.DirectionalLight() })
  light.transform.position.set(10, 20, 30)

  /* Add an instanced mesh */
  world.add({
    transform: new THREE.Mesh(
      new THREE.IcosahedronGeometry(),
      new THREE.MeshStandardMaterial()
    ),
    autorotate: new Vector3(0.01, 0.02, 0.03)
  })
})
