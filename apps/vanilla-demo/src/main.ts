import { plusMinus } from "randomish"
import * as THREE from "three"
import { AmbientLight } from "three"
import { world } from "./ecs"
import "./style.css"
import * as autorotate from "./systems/autorotate"
import * as engine from "./systems/engine"
import * as transform from "./systems/transform"

world.add({
  object3D: new AmbientLight("orange", 0.2)
})

const light = world.add({
  object3D: new THREE.DirectionalLight()
})

light.object3D.position.set(10, 20, 30)

for (let i = 0; i < 100; i++) {
  const e = world.add({
    object3D: new THREE.Mesh(
      new THREE.IcosahedronGeometry(),
      new THREE.MeshStandardMaterial({ color: "yellow" })
    ),

    autorotate: new THREE.Vector3(0.01, 0.02, 0)
  })

  e.object3D.position.set(plusMinus(10), plusMinus(10), plusMinus(5))
}

function tick() {
  engine.update()
  transform.update()
  autorotate.update()

  requestAnimationFrame(tick)
}

tick()
