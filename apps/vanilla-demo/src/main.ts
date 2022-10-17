import { world } from "./ecs"
import "./style.css"
import * as engine from "./systems/engine"
import * as transform from "./systems/transform"
import * as THREE from "three"

world.add({
  transform: new THREE.Mesh(
    new THREE.IcosahedronGeometry(),
    new THREE.MeshBasicMaterial({ color: "yellow" })
  )
})

function tick() {
  engine.update()
  transform.update()

  requestAnimationFrame(tick)
}

tick()
