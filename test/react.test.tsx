import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { act } from "react-dom/test-utils"
import { IEntity, World } from "../src"
import { createReactIntegration } from "../src/react"

type Entity = { name: string } & IEntity

describe("createReactIntegration", () => {
  it("returns a useArchetype function", () => {
    const world = new World<Entity>()
    const react = createReactIntegration(world)
    expect(react).toHaveProperty("useArchetype")
  })

  describe("useArchetype", () => {
    const setup = (fun?: Function) => {
      const world = new World<Entity>()
      const { useArchetype } = createReactIntegration(world)

      world.addEntity({ name: "Alice" })
      world.addEntity({ name: "Bob" })

      const Users = () => {
        const entities = useArchetype("name")

        fun?.()

        return (
          <ul>
            {entities.map(({ id, name }) => (
              <li key={id} data-testid={`user-${id}`}>
                {name}
              </li>
            ))}
          </ul>
        )
      }

      return { world, Users }
    }

    it("returns a list of entities matching the specified archetype", async () => {
      const { Users } = setup()

      render(<Users />)

      expect(screen.getByTestId("user-1")).toHaveTextContent("Alice")
      expect(screen.getByTestId("user-2")).toHaveTextContent("Bob")
    })

    it("re-renders the component when the archetype index updates", async () => {
      let renderCount = 0
      const { world, Users } = setup(() => renderCount++)

      /* queue a new entity to be added */
      world.queue.addEntity({ name: "Charles" })

      /* Render the component. At this point, Charles has not been added to the page. */
      render(<Users />)
      expect(screen.queryByText("Charles")).not.toBeInTheDocument()
      expect(renderCount).toEqual(1)

      /* Now flush the ECS queue. The component should now rerender. */
      act(() => world.queue.flush())
      expect(renderCount).toEqual(2)
      expect(screen.queryByText("Charles")).toBeInTheDocument()
    })

    it("automatically rerenders the component when the list of entities changes", () => {})
  })
})
