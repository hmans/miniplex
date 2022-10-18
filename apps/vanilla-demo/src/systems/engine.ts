import { Bucket, World } from "miniplex"
import * as THREE from "three"
import { MathUtils } from "three"
import { createAutorotateSystem } from "./autorotate"
import { createInstancingSystem } from "./instancing"
import { createTransformSystem } from "./transform"

export type Entity = {
  transform?: THREE.Object3D
  parent?: Entity
  autorotate?: THREE.Vector3

  instance?: {
    imesh: THREE.InstancedMesh
  }

  engine?: {
    renderer: THREE.WebGLRenderer
    camera: THREE.PerspectiveCamera
    scene: THREE.Scene
  }
}

export type System = (dt: number) => void

export function start(
  init: (world: World<Entity>, systems: Bucket<System>) => void
) {
  const world = new World<Entity>()
  const systems = new Bucket<System>()

  systems.add(createTransformSystem(world))
  systems.add(createAutorotateSystem(world))
  systems.add(createInstancingSystem(world))

  const { engine } = world.add({
    engine: {
      renderer: new THREE.WebGLRenderer({ antialias: true }),
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
    }
  })

  /* Set up renderer */
  engine.renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(engine.renderer.domElement)

  /* Set up camera */
  engine.camera.position.z = 50
  engine.scene.add(engine.camera)

  /* Run initializer function */
  init(world, systems)

  /* Add rendering system */
  systems.add(() => {
    engine.renderer.render(engine.scene, engine.camera)
  })

  /* Let's go */
  let lastTime = performance.now()

  function tick() {
    /* Determine deltatime */
    const time = performance.now()
    const dt = MathUtils.clamp((time - lastTime) / 1000, 0, 0.2)
    lastTime = time

    for (const system of systems) {
      system(dt)
    }

    requestAnimationFrame(tick)
  }

  tick()
}
