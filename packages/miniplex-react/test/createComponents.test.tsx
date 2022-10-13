import "@testing-library/jest-dom"
import { render, renderHook, screen } from "@testing-library/react"
import { World } from "miniplex"
import React from "react"
import { createComponents } from "../src"

describe("<Entity>", () => {
  it("creates an entity", () => {
    const world = new World()
    const { Entity } = createComponents(world)

    expect(world.entities.length).toBe(0)
    render(<Entity />)
    expect(world.entities.length).toBe(1)
  })

  it("removes the entity on unmount", () => {
    const world = new World()
    const { Entity } = createComponents(world)

    const { unmount } = render(<Entity />)
    expect(world.entities.length).toBe(1)
    unmount()
    expect(world.entities.length).toBe(0)
  })

  it("accepts a function as its child", () => {
    const world = new World<{ foo: string }>()
    const { Entity } = createComponents(world)

    const entity = world.add({ foo: "bar" })

    render(
      <Entity entity={entity}>{(entity) => <div>{entity.foo}</div>}</Entity>
    )

    expect(world.entities[0].foo).toBe("bar")
    expect(screen.getByText("bar")).toBeInTheDocument()
  })

  it("accepts a React function component as a child", () => {
    type Entity = { name: string; age: number }
    const world = new World<Entity>()
    const { Entity } = createComponents(world)

    const entity = world.add({ name: "Alice", age: 30 })

    const User = (entity: Entity) => <p>Name: {entity.name}</p>

    render(<Entity entity={entity} children={User} />)

    expect(screen.getByText("Name: Alice")).toBeInTheDocument()
  })

  describe("with a given entity that is not yet part of the bucket", () => {
    it("adds the entity to the bucket", () => {
      const world = new World()
      const { Entity } = createComponents(world)
      const entity = {}

      expect(world.entities.length).toBe(0)
      render(<Entity entity={entity} />)
      expect(world.entities.length).toBe(1)
      expect(world.entities[0]).toBe(entity)
    })

    it("removes the entity on unmount", () => {
      const world = new World()
      const { Entity } = createComponents(world)
      const entity = {}

      const { unmount } = render(<Entity entity={entity} />)
      expect(world.entities.length).toBe(1)
      unmount()
      expect(world.entities.length).toBe(0)
    })
  })
})

describe("<Property>", () => {
  it("assigns the specified property", () => {
    const world = new World()
    const { Entity, Property } = createComponents(world)

    render(
      <Entity>
        <Property name="foo" value="bar" />
      </Entity>
    )
    expect(world.entities[0]).toMatchObject({})
    expect(world.entities[0].foo).toBe("bar")
  })

  it("updates the specified property on re-rendering", () => {
    const world = new World()
    const { Entity, Property } = createComponents(world)

    const { rerender } = render(
      <Entity>
        <Property name="foo" value="bar" />
      </Entity>
    )
    expect(world.entities[0].foo).toBe("bar")

    rerender(
      <Entity>
        <Property name="foo" value="baz" />
      </Entity>
    )
    expect(world.entities[0].foo).toBe("baz")
  })

  it("removes the property when the component is unmounted", () => {
    const world = new World()
    const entity = world.add({})
    const { Entity, Property } = createComponents(world)

    const { unmount } = render(
      <Entity entity={entity}>
        <Property name="foo" value="bar" />
      </Entity>
    )
    expect(world.entities[0].foo).toBe("bar")

    unmount()
    expect(world.entities[0]).toMatchObject({})
  })

  it("captures the ref of the child when it has one", () => {
    const world = new World()
    const { Entity, Property } = createComponents(world)

    const ref = React.createRef<HTMLDivElement>()

    render(
      <Entity>
        <Property name="foo">
          <div ref={ref} />
        </Property>
      </Entity>
    )

    expect(world.entities[0].foo).toBe(ref.current)
  })
})

describe("<Entities>", () => {
  it("renders a list of entities", () => {
    const world = new World<{ name: string }>()
    const { Entities } = createComponents(world)

    world.add({ name: "Alice" })
    world.add({ name: "Bob" })

    render(
      <Entities entities={world.entities}>
        {(entity) => <p>{entity.name}</p>}
      </Entities>
    )

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })
})

describe("<Bucket>", () => {
  it("renders the entities within the given bucket", () => {
    const world = new World<{ name: string }>()
    const { Bucket } = createComponents(world)

    world.add({ name: "Alice" })
    world.add({ name: "Bob" })

    render(<Bucket bucket={world}>{(entity) => <p>{entity.name}</p>}</Bucket>)

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("re-renders the entities when the bucket contents change", () => {
    const world = new World<{ name: string }>()
    const { Bucket } = createComponents(world)

    world.add({ name: "Alice" })
    world.add({ name: "Bob" })

    const { rerender } = render(
      <Bucket bucket={world}>{(entity) => <p>{entity.name}</p>}</Bucket>
    )

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()

    world.add({ name: "Charlie" })
    rerender(<Bucket bucket={world}>{(entity) => <p>{entity.name}</p>}</Bucket>)

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("Charlie")).toBeInTheDocument()
  })
})

describe("<Archetype>", () => {
  it("renders the entities within the given archetype bucket", () => {
    const world = new World<{ name: string }>()
    const { Archetype } = createComponents(world)

    world.add({ name: "Alice" })
    world.add({ name: "Bob" })

    render(
      <Archetype properties="name">
        {(entity) => <p>{entity.name}</p>}
      </Archetype>
    )

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("re-renders the entities when the bucket contents change", () => {
    const world = new World<{ name: string }>()
    const { Archetype } = createComponents(world)

    world.add({ name: "Alice" })
    world.add({ name: "Bob" })

    const { rerender } = render(
      <Archetype properties="name">
        {(entity) => <p>{entity.name}</p>}
      </Archetype>
    )

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()

    world.add({ name: "Charlie" })
    rerender(
      <Archetype properties="name">
        {(entity) => <p>{entity.name}</p>}
      </Archetype>
    )

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("Charlie")).toBeInTheDocument()
  })
})

describe("useArchetype", () => {
  it("returns the entities of the specified archetype and re-renders the component when the archetype updates", () => {
    const world = new World<{ name: string }>()
    const { useArchetype } = createComponents(world)

    world.add({ name: "Alice" })
    world.add({ name: "Bob" })

    const { result } = renderHook(() => useArchetype("name"))

    expect(result.current).toHaveLength(2)
    expect(result.current[0].name).toBe("Alice")
    expect(result.current[1].name).toBe("Bob")

    world.add({ name: "Charlie" })

    expect(result.current).toHaveLength(3)
    expect(result.current[0].name).toBe("Alice")
    expect(result.current[1].name).toBe("Bob")
    expect(result.current[2].name).toBe("Charlie")
  })
})
