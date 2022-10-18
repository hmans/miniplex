import { Environment, Loader, PerspectiveCamera } from "@react-three/drei"
import { Perf } from "r3f-perf"
import { StrictMode, Suspense, useLayoutEffect } from "react"
import * as RC from "render-composer"
import { Asteroids } from "./entities/Asteroids"
import { Bullets } from "./entities/Bullets"
import { Player } from "./entities/Player"
import { MouseInput } from "./entities/MouseInput"
import { ECS } from "./state"
import { Systems } from "./Systems"

function App() {
  return (
    <>
      <Loader />
      <RC.Canvas shadows dpr={1}>
        <StrictMode>
          <RC.RenderPipeline>
            <RC.EffectPass>
              <RC.SMAAEffect />
              <RC.SelectiveBloomEffect intensity={5} />
              <RC.VignetteEffect />
            </RC.EffectPass>
            <RC.EffectPass>
              <RC.TiltShiftEffect />
            </RC.EffectPass>

            <color args={["#223"]} attach="background" />
            <Suspense>
              <Environment preset="sunset" />

              <ambientLight intensity={0.2} />
              <directionalLight
                position={[10, 10, 30]}
                castShadow
                intensity={1}
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-far={200}
                shadow-camera-left={-100}
                shadow-camera-right={100}
                shadow-camera-top={100}
                shadow-camera-bottom={-100}
              />

              <ECS.Entity>
                <ECS.Component name="isCamera" value={true} />
                <ECS.Component name="transform">
                  <PerspectiveCamera position={[0, 0, 1000]} makeDefault />
                </ECS.Component>
              </ECS.Entity>

              <MouseInput />
              <Player />
              <Asteroids />
              <Bullets />

              <Systems />

              {/* <Perf position="bottom-right" matrixUpdate /> */}
            </Suspense>
          </RC.RenderPipeline>
        </StrictMode>
      </RC.Canvas>
    </>
  )
}

export default App
