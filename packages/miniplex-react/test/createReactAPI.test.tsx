import "@testing-library/jest-dom"
import { act, render, renderHook, screen } from "@testing-library/react"
import { all, World } from "@miniplex/core"
import React from "react"
import createReactAPI from "../src"

describe("<Entity>", () => {
  it("creates an entity", () => {
    const world = new World()
    const { Entity } = createReactAPI(world)

    expect(world.entities.length).toBe(0)
    render(<Entity />)
    expect(world.entities.length).toBe(1)
  })

  it("removes the entity on unmount", () => {
    const world = new World()
    const { Entity } = createReactAPI(world)

    const { unmount } = render(<Entity />)
    expect(world.entities.length).toBe(1)
    unmount()
    expect(world.entities.length).toBe(0)
  })

  it("accepts a function as its child", () => {
    const world = new World<{ foo: string }>()
    const { Entity } = createReactAPI(world)

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
    const { Entity } = createReactAPI(world)

    const entity = world.add({ name: "Alice", age: 30 })

    const User = (entity: Entity) => <p>Name: {entity.name}</p>

    render(<Entity entity={entity} children={User} />)

    expect(screen.getByText("Name: Alice")).toBeInTheDocument()
  })

  describe("with a given entity that is not yet part of the bucket", () => {
    it("adds the entity to the bucket", () => {
      const world = new World()
      const { Entity } = createReactAPI(world)
      const entity = {}

      expect(world.entities.length).toBe(0)
      render(<Entity entity={entity} />)
      expect(world.entities.length).toBe(1)
      expect(world.entities[0]).toBe(entity)
    })

    it("removes the entity on unmount", () => {
      const world = new World()
      const { Entity } = createReactAPI(world)
      const entity = {}

      const { unmount } = render(<Entity entity={entity} />)
      expect(world.entities.length).toBe(1)
      unmount()
      expect(world.entities.length).toBe(0)
    })
  })

  describe("given an `as` prop", () => {
    it("renders the entity using that component, passing the entity to it", () => {
      const world = new World<{ foo: string }>()
      const { Entity } = createReactAPI(world)

      const entity = world.add({ foo: "bar" })

      const Foo = (props: { entity: { foo: string } }) => (
        <div>{props.entity.foo}</div>
      )

      render(<Entity as={Foo} entity={entity} />)

      expect(screen.getByText("bar")).toBeInTheDocument()
    })
  })
})

describe("<Property>", () => {
  it("assigns the specified component", () => {
    const world = new World()
    const { Entity, Component } = createReactAPI(world)

    render(
      <Entity>
        <Component name="foo" value="bar" />
      </Entity>
    )
    expect(world.entities[0]).toMatchObject({})
    expect(world.entities[0].foo).toBe("bar")
  })

  it("updates the specified component on re-rendering", () => {
    const world = new World()
    const { Entity, Component } = createReactAPI(world)

    const { rerender } = render(
      <Entity>
        <Component name="foo" value="bar" />
      </Entity>
    )
    expect(world.entities[0].foo).toBe("bar")

    rerender(
      <Entity>
        <Component name="foo" value="baz" />
      </Entity>
    )
    expect(world.entities[0].foo).toBe("baz")
  })

  it("removes the component when the component is unmounted", () => {
    const world = new World()
    const entity = world.add({})
    const { Entity, Component } = createReactAPI(world)

    const { unmount } = render(
      <Entity entity={entity}>
        <Component name="foo" value="bar" />
      </Entity>
    )
    expect(world.entities[0].foo).toBe("bar")

    unmount()
    expect(world.entities[0]).toMatchObject({})
  })

  it("captures the ref of the child when it has one", () => {
    const world = new World()
    const { Entity, Component } = createReactAPI(world)

    const ref = React.createRef<HTMLDivElement>()

    render(
      <Entity>
        <Component name="foo">
          <div ref={ref} />
        </Component>
      </Entity>
    )

    expect(world.entities[0].foo).toBe(ref.current)
  })

  describe("when the entity already has the component", () => {
    it("updates the component", () => {
      const world = new World()
      const { Entity, Component } = createReactAPI(world)
      const entity = world.add({ foo: "bar" })

      render(
        <Entity entity={entity}>
          <Component name="foo" value="baz" />
        </Entity>
      )

      expect(world.entities[0].foo).toBe("baz")
    })
  })
})

describe("<Entities>", () => {
  it("renders a list of entities", () => {
    const world = new World<{ name: string }>()
    const { Entities } = createReactAPI(world)

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

  describe("given an `as` prop", () => {
    it("renders the entities using the given component, passing the entity to it", () => {
      type Entity = { name: string }
      const world = new World<Entity>()
      const { Entities } = createReactAPI(world)

      world.add({ name: "Alice" })
      world.add({ name: "Bob" })

      const User = (props: { entity: Entity }) => <div>{props.entity.name}</div>

      render(<Entities as={User} entities={world.entities} />)

      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("Bob")).toBeInTheDocument()
    })
  })
})

describe("<Bucket>", () => {
  it("renders the entities within the given bucket", () => {
    const world = new World<{ name: string }>()
    const { Bucket } = createReactAPI(world)

    world.add({ name: "Alice" })
    world.add({ name: "Bob" })

    render(<Bucket bucket={world}>{(entity) => <p>{entity.name}</p>}</Bucket>)

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("re-renders the entities when the bucket contents change", () => {
    const world = new World<{ name: string }>()
    const { Bucket } = createReactAPI(world)

    const alice = world.add({ name: "Alice" })
    world.add({ name: "Bob" })

    render(<Bucket bucket={world}>{(entity) => <p>{entity.name}</p>}</Bucket>)

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()

    act(() => {
      world.add({ name: "Charlie" })
    })

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("Charlie")).toBeInTheDocument()

    act(() => {
      world.remove(alice)
    })

    expect(screen.queryByText("Alice")).toBeNull()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("Charlie")).toBeInTheDocument()
  })

  describe("given an `as` prop", () => {
    it("renders the entities using the given component, passing the entity to it", () => {
      type Entity = { name: string }
      const world = new World<Entity>()
      const { Bucket } = createReactAPI(world)

      world.add({ name: "Alice" })
      world.add({ name: "Bob" })

      const User = (props: { entity: Entity }) => <div>{props.entity.name}</div>

      render(<Bucket as={User} bucket={world} />)

      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("Bob")).toBeInTheDocument()
    })
  })
})

describe("<Archetype>", () => {
  it("renders the entities within the given archetype bucket", () => {
    const world = new World<{ name: string }>()
    const { Archetype } = createReactAPI(world)

    world.add({ name: "Alice" })
    world.add({ name: "Bob" })

    render(
      <Archetype components="name">
        {(entity) => <p>{entity.name}</p>}
      </Archetype>
    )

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("re-renders the entities when the bucket contents change", () => {
    const world = new World<{ name: string; age?: number }>()
    const { Archetype } = createReactAPI(world)

    world.add({ name: "Alice" })
    world.add({ name: "Bob" })

    render(
      <Archetype components="name">
        {(entity) => <p>{entity.name}</p>}
      </Archetype>
    )

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()

    act(() => {
      world.add({ name: "Charlie" })
    })

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("Charlie")).toBeInTheDocument()
  })

  describe("given an `as` prop", () => {
    it("renders the entities using the given component, passing the entity to it", () => {
      type Entity = { name: string }
      const world = new World<Entity>()
      const { Archetype } = createReactAPI(world)

      world.add({ name: "Alice" })
      world.add({ name: "Bob" })

      const User = (props: { entity: Entity }) => <div>{props.entity.name}</div>

      render(<Archetype as={User} components="name" />)

      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("Bob")).toBeInTheDocument()
    })
  })
})

describe("<Query>", () => {
  it("accepts a query object as its `query` prop", () => {
    type Entity = { name: string; age?: number }
    const world = new World<Entity>()
    const { Query } = createReactAPI(world)

    world.add({ name: "Alice" })
    world.add({ name: "Bob", age: 100 })

    render(
      <Query query={all("name")}>{(entity) => <p>{entity.name}</p>}</Query>
    )

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })
})

describe("useArchetype", () => {
  it("returns the entities of the specified archetype and re-renders the component when the archetype updates", () => {
    const world = new World<{ name: string }>()
    const { useArchetype } = createReactAPI(world)

    world.add({ name: "Alice" })
    world.add({ name: "Bob" })

    const { result } = renderHook(() => useArchetype("name"))

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
