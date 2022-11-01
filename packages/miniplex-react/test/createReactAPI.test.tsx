import { With, World } from "@miniplex/core"
import "@testing-library/jest-dom"
import { act, render, screen } from "@testing-library/react"
import React from "react"
import createReactAPI from "../src"

type Entity = {
  name: string
  age?: number
  height?: number
}

describe("<Entity>", () => {
  it("creates an entity", () => {
    const world = new World<Entity>()
    const { Entity } = createReactAPI(world)

    expect(world.entities.length).toBe(0)
    render(<Entity />)
    expect(world.entities.length).toBe(1)
  })

  it("removes the entity on unmount", () => {
    const world = new World<Entity>()
    const { Entity } = createReactAPI(world)

    const { unmount } = render(<Entity />)
    expect(world.entities.length).toBe(1)
    unmount()
    expect(world.entities.length).toBe(0)
  })

  it("accepts a function as its child", () => {
    const world = new World<Entity>()
    const { Entity } = createReactAPI(world)

    const entity = world.add({ name: "John" })

    render(
      <Entity entity={entity}>{(entity) => <div>{entity.name}</div>}</Entity>
    )

    expect(world.entities[0].name).toBe("John")
    expect(screen.getByText("John")).toBeInTheDocument()
  })

  it("accepts a React function component as a child", () => {
    const world = new World<Entity>()
    const { Entity } = createReactAPI(world)

    const entity = world.add({ name: "Alice", age: 30 })

    const User = (entity: Entity) => <p>Name: {entity.name}</p>

    render(<Entity entity={entity} children={User} />)

    expect(screen.getByText("Name: Alice")).toBeInTheDocument()
  })

  describe("with a given entity that is not yet part of the bucket", () => {
    it("adds the entity to the bucket", () => {
      const world = new World<Entity>()
      const { Entity } = createReactAPI(world)
      const entity = { name: "John" }

      expect(world.entities.length).toBe(0)
      render(<Entity entity={entity} />)
      expect(world.entities.length).toBe(1)
      expect(world.entities[0]).toBe(entity)
    })

    it("removes the entity on unmount", () => {
      const world = new World<Entity>()
      const { Entity } = createReactAPI(world)
      const entity = { name: "John" }

      const { unmount } = render(<Entity entity={entity} />)
      expect(world.entities.length).toBe(1)
      unmount()
      expect(world.entities.length).toBe(0)
    })
  })

  describe("given an `as` prop", () => {
    it("renders the entity using that component, passing the entity to it", () => {
      const world = new World<Entity>()
      const { Entity } = createReactAPI(world)

      const entity = world.add({ name: "John" })

      const Person = (props: { entity: Entity }) => (
        <div>{props.entity.name}</div>
      )

      render(<Entity as={Person} entity={entity} />)

      expect(screen.getByText("John")).toBeInTheDocument()
    })
  })
})

describe("<Property>", () => {
  it("assigns the specified component", () => {
    const world = new World<Entity>()
    const { Entity, Component } = createReactAPI(world)

    render(
      <Entity>
        <Component name="name" value="John" />
      </Entity>
    )
    expect(world.entities[0]).toMatchObject({})
    expect(world.entities[0].name).toBe("John")
  })

  it("updates the specified component on re-rendering", () => {
    const world = new World<Entity>()
    const { Entity, Component } = createReactAPI(world)

    const { rerender } = render(
      <Entity>
        <Component name="name" value="John" />
      </Entity>
    )
    expect(world.entities[0].name).toBe("John")

    rerender(
      <Entity>
        <Component name="name" value="Jane" />
      </Entity>
    )
    expect(world.entities[0].name).toBe("Jane")
  })

  it("removes the component when the component is unmounted", () => {
    const world = new World<Entity>()
    const entity = world.add({ name: "John" })
    const { Entity, Component } = createReactAPI(world)

    const { unmount } = render(
      <Entity entity={entity}>
        <Component name="age" value={50} />
      </Entity>
    )
    expect(world.entities[0].age).toBe(50)

    unmount()
    expect(world.entities[0]).toEqual({ name: "John" })
  })

  it("captures the ref of the child when it has one", () => {
    const world = new World<{ div: HTMLDivElement }>()
    const { Entity, Component } = createReactAPI(world)

    const ref = React.createRef<HTMLDivElement>()

    render(
      <Entity>
        <Component name="div">
          <div ref={ref} />
        </Component>
      </Entity>
    )

    expect(world.entities[0].div).toBe(ref.current)
  })

  describe("when the entity already has the component", () => {
    it("updates the component", () => {
      const world = new World<Entity>()
      const { Entity, Component } = createReactAPI(world)
      const entity = world.add({ name: "John" })

      render(
        <Entity entity={entity}>
          <Component name="name" value="Jane" />
        </Entity>
      )

      expect(world.entities[0].name).toBe("Jane")
    })
  })
})

describe("<Entities>", () => {
  describe("with a bucket", () => {
    it("renders the entities within the given bucket", () => {
      const world = new World<Entity>()
      const { Entities } = createReactAPI(world)

      world.add({ name: "Alice" })
      world.add({ name: "Bob" })

      render(<Entities in={world}>{(entity) => <p>{entity.name}</p>}</Entities>)

      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("Bob")).toBeInTheDocument()
    })

    it("re-renders the entities when the bucket contents change", () => {
      const world = new World<Entity>()
      const { Entities } = createReactAPI(world)

      const alice = world.add({ name: "Alice" })
      world.add({ name: "Bob" })

      render(<Entities in={world}>{(entity) => <p>{entity.name}</p>}</Entities>)

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
  })

  describe("given an `as` prop", () => {
    it("renders the entities using the given component, passing the entity to it", () => {
      const world = new World<Entity>()
      const { Entities } = createReactAPI(world)

      world.add({ name: "Alice" })
      world.add({ name: "Bob" })

      const User = (props: { entity: Entity }) => <div>{props.entity.name}</div>

      render(<Entities as={User} in={world} />)

      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("Bob")).toBeInTheDocument()
    })
  })
})

describe("world", () => {
  it("is a reference to the world originally passed into createReactAPI", () => {
    const world = new World<{ name: string }>()
    const api = createReactAPI(world)
    expect(api.world).toBe(world)
  })
})
