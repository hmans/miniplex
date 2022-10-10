import { createECS } from "miniplex-react"
import { useEffect, useState } from "react"
import "./App.css"

const ECS = createECS<{ count: number; div: HTMLDivElement }>()

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log(ECS.world.entities.length)
    console.log(ECS.world.entities[0])
    console.log("Count on the component is:", ECS.world.entities[0].count)
    console.log("DIV on the component is:", ECS.world.entities[0].div)
  })

  return (
    <div>
      <ECS.Entity>
        <ECS.Component name="count" data={count} />
        <ECS.Component name="div">
          <div>I'm a DIV, my count is {count}!</div>
        </ECS.Component>
      </ECS.Entity>

      <button onClick={() => setCount((c) => c + 1)}>
        Increase & Rerender
      </button>
    </div>
  )
}

export default App
