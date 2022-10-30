import { archetype, World } from "@miniplex/core"
import { act, renderHook } from "@testing-library/react"
import { useEntities } from "../src"

describe("useEntities", () => {
  it("returns the entities of the specified archetype and re-renders the component when the archetype updates", () => {
    const world = new World<{ name: string }>()

    world.add({ name: "Alice" })
    world.add({ name: "Bob" })

    const { result } = renderHook(() =>
      useEntities(world.where(archetype("name")))
    )

    const { entities } = result.current

    expect(entities).toHaveLength(2)
    expect(entities[0].name).toBe("Alice")
    expect(entities[1].name).toBe("Bob")

    act(() => {
      world.add({ name: "Charlie" })
    })

    expect(entities).toHaveLength(3)
    expect(entities[0].name).toBe("Alice")
    expect(entities[1].name).toBe("Bob")
    expect(entities[2].name).toBe("Charlie")
  })
})
