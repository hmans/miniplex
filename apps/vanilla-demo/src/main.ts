import { chance, plusMinus } from "randomish"
import * as THREE from "three"
import { AmbientLight } from "three"
import "./style.css"
import * as engine from "./systems/engine"

engine.start((world, _runner) => {
  /* Add some lights */
  world.add({ transform: new AmbientLight("orange", 0.2) })
  const light = world.add({ transform: new THREE.DirectionalLight() })
  light.transform.position.set(10, 20, 30)

  /* Add a bunch of random entities */
  for (let i = 0; i < 100; i++) {
    const e = world.add({
      transform: new THREE.Mesh(
        chance(0.5) ? new THREE.IcosahedronGeometry() : new THREE.BoxGeometry(),
        new THREE.MeshStandardMaterial({
          color: chance(0.5) ? "yellow" : "orange"
        })
      ),

      autorotate: new THREE.Vector3(plusMinus(2), plusMinus(2), plusMinus(2))
    })

    e.transform.position.set(plusMinus(10), plusMinus(10), plusMinus(5))
  }
})
