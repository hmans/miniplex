/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/react"
import { StrictMode } from "react"
import { makeECS } from "../src/react"

describe("makeECS", () => {
  it("returns a useArchetype function", () => {
    const ecs = makeECS()
    expect(ecs).toHaveProperty("useArchetype")
  })

  describe("useArchetype", () => {
    it("returns a list of entities matching the specified archetype", async () => {
      const ecs = makeECS()
      ecs.immediately.addEntity({ name: "Alice" })

      const Users = () => {
        const entities = ecs.useArchetype("name")
        return (
          <ul>
            {entities.map((entity) => (
              <li>{entity.name}</li>
            ))}
          </ul>
        )
      }

      const page = render(
        <StrictMode>
          <Users />
        </StrictMode>
      )

      await page.findByText("Alice")
    })

    it("automatically rerenders the component when the list of entities changes", () => {})
  })
})
