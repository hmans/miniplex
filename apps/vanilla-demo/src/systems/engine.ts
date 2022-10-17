import * as THREE from "three"
import { world } from "../ecs"

const entities = world.archetype("engine")

export function start() {
  const { engine } = world.add({
    engine: {
      renderer: new THREE.WebGLRenderer(),
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
    }
  })

  engine.camera.position.z = 10
  engine.scene.add(engine.camera)

  engine.renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(engine.renderer.domElement)
}

export function update() {
  for (const { engine } of entities) {
    engine.renderer.render(engine.scene, engine.camera)
  }
}
