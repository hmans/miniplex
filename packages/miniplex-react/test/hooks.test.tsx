import { World } from "@miniplex/core"
import { act, renderHook } from "@testing-library/react"
import { useEntities, useOnEntityAdded, useOnEntityRemoved } from "../src"

describe("useEntities", () => {
  it("returns the entities of the specified archetype and re-renders the component when the archetype updates", () => {
    const world = new World<{ name: string }>()

    world.add({ name: "Alice" })
    world.add({ name: "Bob" })

    const { result } = renderHook(() => useEntities(world.with("name")))

    const { entities } = result.current

    expect(entities).toHaveLength(2)
    expect(entities[0].name).toBe("Bob")
    expect(entities[1].name).toBe("Alice")

    act(() => {
      world.add({ name: "Charlie" })
    })

    expect(entities).toHaveLength(3)
    expect(entities[0].name).toBe("Bob")
    expect(entities[1].name).toBe("Alice")
    expect(entities[2].name).toBe("Charlie")
  })
})

describe(useOnEntityAdded, () => {
  it("calls the callback when an entity is added to the world", () => {
    const world = new World<{ name: string }>()

    const callback = jest.fn()

    renderHook(() => useOnEntityAdded(world, callback))

    act(() => {
      world.add({ name: "Alice" })
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith({ name: "Alice" })
  })
})

describe(useOnEntityRemoved, () => {
  it("calls the callback when an entity is removed from the world", () => {
    const world = new World<{ name: string }>()

    const callback = jest.fn()

    renderHook(() => useOnEntityRemoved(world, callback))

    const entity = world.add({ name: "Alice" })

    act(() => {
      world.remove(entity)
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(entity)
  })
})
