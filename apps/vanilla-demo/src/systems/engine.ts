import { World } from "miniplex"
import * as THREE from "three"
import { MathUtils } from "three"
import { Runner } from "../lib/runner"
import { autorotateSystem } from "./autorotate"
import { transformSystem } from "./transform"

export type Entity = {
  transform?: THREE.Object3D
  parent?: Entity
  autorotate?: THREE.Vector3

  engine?: {
    renderer: THREE.WebGLRenderer
    camera: THREE.PerspectiveCamera
    scene: THREE.Scene
  }
}

export function start(init: (world: World<Entity>, runner: Runner) => void) {
  const world = new World<Entity>()
  const runner = new Runner()

  runner.addSystem(transformSystem(world))
  runner.addSystem(autorotateSystem(world))

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

  init(world, runner)

  runner.addSystem(() => {
    engine.renderer.render(engine.scene, engine.camera)
  })

  /* Let's go */
  let lastTime = performance.now()

  function tick() {
    /* Determine deltatime */
    const time = performance.now()
    const dt = MathUtils.clamp((time - lastTime) / 1000, 0, 0.2)
    lastTime = time

    runner.update(dt)

    requestAnimationFrame(tick)
  }

  tick()
}
