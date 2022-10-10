import { createECS } from "miniplex-react"
import { useEffect, useState } from "react"
import "./App.css"

const ECS = createECS<{ count: number }>()

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log("Count on the component is:", ECS.world.entities[0]?.count)
  })

  return (
    <div>
      <ECS.Entity>
        <ECS.Component name="count" data={count} />
      </ECS.Entity>

      <p>Count is: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>
        Increase & Rerender
      </button>
    </div>
  )
}

export default App
