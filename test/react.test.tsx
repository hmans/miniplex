import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { makeECS } from "../src/react"

describe("makeECS", () => {
  it("returns a useArchetype function", () => {
    const ecs = makeECS()
    expect(ecs).toHaveProperty("useArchetype")
  })

  describe("useArchetype", () => {
    const setup = () => {
      const ecs = makeECS()
      ecs.immediately.addEntity({ name: "Alice" })
      ecs.immediately.addEntity({ name: "Bob" })

      return { ecs }
    }

    it("returns a list of entities matching the specified archetype", async () => {
      const { ecs } = setup()

      const Users = () => {
        const entities = ecs.useArchetype("name")

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

      render(<Users />)

      expect(screen.getByTestId("user-1")).toHaveTextContent("Alice")
      expect(screen.getByTestId("user-2")).toHaveTextContent("Bob")
    })

    it("automatically rerenders the component when the list of entities changes", () => {})
  })
})
