import { world } from "./ecs"
import "./style.css"
import * as engine from "./systems/engine"
import * as transform from "./systems/transform"
import * as autorotate from "./systems/autorotate"
import * as THREE from "three"

world.add({
  object3D: new THREE.Mesh(
    new THREE.IcosahedronGeometry(),
    new THREE.MeshBasicMaterial({ color: "yellow" })
  ),

  autorotate: new THREE.Vector3(0.01, 0.02, 0)
})

function tick() {
  engine.update()
  transform.update()
  autorotate.update()

  requestAnimationFrame(tick)
}

tick()
