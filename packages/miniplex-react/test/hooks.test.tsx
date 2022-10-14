import { act, renderHook } from "@testing-library/react"
import { World } from "miniplex"
import { useArchetype } from "../src"

describe("useArchetype", () => {
  it("returns the entities of the specified archetype and re-renders the component when the archetype updates", () => {
    const world = new World<{ name: string }>()

    world.add({ name: "Alice" })
    world.add({ name: "Bob" })

    const { result } = renderHook(() => useArchetype(world, "name"))

    expect(result.current).toHaveLength(2)
    expect(result.current[0].name).toBe("Alice")
    expect(result.current[1].name).toBe("Bob")

    act(() => {
      world.add({ name: "Charlie" })
    })

    expect(result.current).toHaveLength(3)
    expect(result.current[0].name).toBe("Alice")
    expect(result.current[1].name).toBe("Bob")
    expect(result.current[2].name).toBe("Charlie")
  })
})
