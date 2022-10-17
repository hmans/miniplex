import "./style.css"
import { engineSystem } from "./systems/engine"

const update = engineSystem()

function tick() {
  update()
  requestAnimationFrame(tick)
}

tick()
