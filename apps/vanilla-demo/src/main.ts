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
    transform: new THREE.Group(),
    mesh: {
      geometry: new THREE.IcosahedronGeometry(),
      material: new THREE.MeshStandardMaterial()
    },
    instanced: true,
    autorotate: new Vector3(0.1, 0.2, 0.3)
  })
})
