import "./style.css"
import * as Engine from "./systems/engine"

function tick() {
  Engine.update()
  requestAnimationFrame(tick)
}

tick()
