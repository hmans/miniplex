import { Environment, Loader, PerspectiveCamera } from "@react-three/drei"
import { StrictMode, Suspense } from "react"
import * as RC from "render-composer"
import { Asteroids } from "./entities/Asteroids"
import { Bullets } from "./entities/Bullets"
import { Player } from "./entities/Player"
import { ECS } from "./state"
import { Systems } from "./Systems"

function App() {
  return (
    <>
      <Loader />
      {/*
      This example game uses Render Composer, a small library that allows you to declare
      render pipelines for R3F apps, and ships with an opinionated default pipeline:

      https://github.com/hmans/composer-suite/tree/main/packages/render-composer
      */}
      <RC.Canvas shadows dpr={1}>
        <StrictMode>
          <RC.RenderPipeline>
            {/* Define an EffectPass with some postprocessing */}
            <RC.EffectPass>
              <RC.SMAAEffect />
              <RC.SelectiveBloomEffect intensity={5} />
              <RC.TiltShiftEffect focusArea={1} kernelSize={2} feather={10} />
              <RC.VignetteEffect />
            </RC.EffectPass>

            {/* Scene Background */}
            <color args={["#223"]} attach="background" />

            <Suspense>
              {/* Environment */}
              <Environment preset="sunset" />

              {/* Lights */}
              <ambientLight intensity={0.2} />
              <directionalLight position={[10, 10, 30]} intensity={1} />

              {/* The main camera. We can declare ECS entities ad-hoc like this: */}
              <ECS.Entity>
                <ECS.Component name="isCamera" data={true} />

                {/* If an ECS component has a React child, the ref to the rendered element
                will be assigned to the specified ECS component: */}
                <ECS.Component name="transform">
                  <PerspectiveCamera position={[0, 0, 1000]} makeDefault />
                </ECS.Component>
              </ECS.Entity>

              {/* The actual game entities: */}
              <Player />
              <Asteroids />
              <Bullets />

              {/* We've bundled all game systems in a top-level <Systems/> component. */}
              <Systems />
            </Suspense>
          </RC.RenderPipeline>
        </StrictMode>
      </RC.Canvas>
    </>
  )
}

export default App
