import { number, plusMinus } from "randomish"
import * as THREE from "three"
import { AmbientLight, Vector3 } from "three"
import "./style.css"
import * as engine from "./systems/engine"

/* TODO: extract to randomish */
function pick<T>(from: T[]) {
  return from[Math.floor(number(from.length))]
}

engine.start((world, _runner) => {
  /* Add some lights */
  world.add({ transform: new AmbientLight("orange", 0.2) })
  const light = world.add({ transform: new THREE.DirectionalLight() })
  light.transform.position.set(10, 20, 30)

  /* Add an instanced mesh */
  const geometries = [
    new THREE.IcosahedronGeometry(),
    new THREE.DodecahedronGeometry(),
    new THREE.BoxGeometry(),
    new THREE.SphereGeometry()
  ]

  const materials = [
    new THREE.MeshStandardMaterial({ color: "hotpink" }),
    new THREE.MeshStandardMaterial({ color: "orange" }),
    new THREE.MeshStandardMaterial({ color: "green" })
  ]

  for (let i = 0; i < 2000; i++) {
    const entity = world.add({
      transform: new THREE.Group(),
      mesh: {
        geometry: pick(geometries),
        material: pick(materials)
      },
      instanced: true,
      autorotate: new Vector3(plusMinus(0.5), plusMinus(0.5), plusMinus(0.5))
    })

    entity.transform.position.set(plusMinus(30), plusMinus(30), plusMinus(30))
  }
})
