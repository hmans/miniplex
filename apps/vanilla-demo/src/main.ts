import "./style.css"
import * as THREE from "three"

function engineSystem() {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )

  camera.position.z = 30
  scene.add(camera)

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(),
    new THREE.MeshBasicMaterial({ color: "red" })
  )

  scene.add(mesh)

  return () => {
    mesh.rotation.x += 0.01
    mesh.rotation.y += 0.01

    renderer.render(scene, camera)
  }
}

const update = engineSystem()

function tick() {
  update()
  requestAnimationFrame(tick)
}

tick()
