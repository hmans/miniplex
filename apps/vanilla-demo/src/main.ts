import { chance, plusMinus } from "randomish"
import * as THREE from "three"
import { AmbientLight, MathUtils } from "three"
import { world } from "./ecs"
import "./style.css"
import * as autorotate from "./systems/autorotate"
import * as engine from "./systems/engine"
import * as transform from "./systems/transform"

world.add({
  transform: new AmbientLight("orange", 0.2)
})

const light = world.add({
  transform: new THREE.DirectionalLight()
})

light.transform.position.set(10, 20, 30)

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

let lastTime = performance.now()

function tick() {
  /* Determine deltatime */
  const time = performance.now()
  const dt = MathUtils.clamp((time - lastTime) / 1000, 0, 0.2)
  lastTime = time

  engine.update()
  transform.update()
  autorotate.update(dt)

  requestAnimationFrame(tick)
}

tick()
