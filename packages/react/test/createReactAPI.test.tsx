import "@testing-library/jest-dom"
import { act, render, screen } from "@testing-library/react"
import { World } from "miniplex"
import React, { StrictMode } from "react"
import createReactAPI from "../src"

type Entity = {
  name: string
  age?: number
  height?: number
}

/*
Hide errors thrown by React (we're testing for them.)
See: https://dev.to/martinemmert/hide-red-console-error-log-wall-while-testing-errors-with-jest-2bfn
*/
beforeEach(() => {
  jest.spyOn(console, "error")
  // @ts-ignore jest.spyOn adds this functionallity
  console.error.mockImplementation(() => null)
})

afterEach(() => {
  // @ts-ignore jest.spyOn adds this functionallity
  console.error.mockRestore()
})

describe("<Entity>", () => {
  it("creates an entity", () => {
    const world = new World<Entity>()
    const { Entity } = createReactAPI(world)

    expect(world.entities.length).toBe(0)
    render(<Entity />)
    expect(world.entities.length).toBe(1)
  })

  it("allows ref forwarding", () => {
    const world = new World<Entity>()
    const { Entity } = createReactAPI(world)
    const ref = React.createRef<Entity>()

    render(<Entity ref={ref} />)

    expect(ref.current).not.toBeNull()
    expect(ref.current).toBe(world.first)
  })

  it("keeps the entity when the component is rerendered", () => {
    const world = new World<Entity>()
    const { Entity } = createReactAPI(world)

    expect(world.entities.length).toBe(0)

    /* Create a new entity and make sure the component is not memozied. */
    const Test = () => <Entity>{Math.random()}</Entity>

    const { rerender } = render(<Test />)
    expect(world.entities.length).toBe(1)
    const entity = world.first

    rerender(<Test />)
    expect(world.entities.length).toBe(1)
    expect(world.first).toBe(entity)
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

  describe("given `children` prop", () => {
    it("renders the entity using that component, passing the entity to it", () => {
      const world = new World<Entity>()
      const { Entity } = createReactAPI(world)

      const entity = world.add({ name: "John" })

      const Person = ({ name }: { name: string }) => <div>{name}</div>

      render(<Entity entity={entity} children={Person} />)

      expect(screen.getByText("John")).toBeInTheDocument()
    })
  })
})

describe("<Component>", () => {
  it("assigns the specified component", () => {
    const world = new World<Entity>()
    const { Entity, Component } = createReactAPI(world)

    render(
      <Entity>
        <Component name="name" data="John" />
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
        <Component name="name" data="John" />
      </Entity>
    )
    expect(world.entities[0].name).toBe("John")

    rerender(
      <Entity>
        <Component name="name" data="Jane" />
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
        <Component name="age" data={50} />
      </Entity>
    )
    expect(world.entities[0].age).toBe(50)

    unmount()
    expect(world.entities[0]).toEqual({ name: "John" })
  })

  it("captures the ref of the child when it has one", () => {
    const world = new World<{ div?: HTMLDivElement }>()
    const entity = world.add({})

    const { Entity, Component } = createReactAPI(world)

    const ref = React.createRef<HTMLDivElement>()

    const { unmount } = render(
      <Entity entity={entity}>
        <Component name="div">
          <div ref={ref} />
        </Component>
      </Entity>
    )

    expect(entity.div).toBe(ref.current)

    unmount()

    expect(entity.div).toBe(undefined)
  })

  describe("when the entity already has the component", () => {
    it("updates the component", () => {
      const world = new World<Entity>()
      const { Entity, Component } = createReactAPI(world)
      const entity = world.add({ name: "John" })

      render(
        <Entity entity={entity}>
          <Component name="name" data="Jane" />
        </Entity>
      )

      expect(world.entities[0].name).toBe("Jane")
    })
  })
})

describe("<Entities>", () => {
  describe("with an array of entities", () => {
    it("renders the entities", () => {
      const world = new World<Entity>()
      const { Entities } = createReactAPI(world)

      const entities = [
        world.add({ name: "John" }),
        world.add({ name: "Jane" })
      ]

      render(
        <Entities in={entities}>{(entity) => <p>{entity.name}</p>}</Entities>
      )

      expect(screen.getByText("John")).toBeInTheDocument()
      expect(screen.getByText("Jane")).toBeInTheDocument()
    })
  })

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

      render(
        <StrictMode>
          <Entities in={world}>{(entity) => <p>{entity.name}</p>}</Entities>
        </StrictMode>
      )

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

  describe("given an `children` prop", () => {
    it("renders the entities using the given component, passing the entity to it", () => {
      const world = new World<Entity>()
      const { Entities } = createReactAPI(world)

      world.add({ name: "Alice" })
      world.add({ name: "Bob" })

      const User = ({ name }: { name: string }) => <div>{name}</div>

      render(<Entities in={world} children={User} />)

      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("Bob")).toBeInTheDocument()
    })
  })
})

describe("useCurrentEntity", () => {
  describe("when invoked within an entity context", () => {
    it("returns the context's entity", () => {
      const world = new World<Entity>()
      const { Entity, useCurrentEntity } = createReactAPI(world)

      const entity = world.add({ name: "John" })

      const Test = () => {
        const currentEntity = useCurrentEntity()
        return <p>{currentEntity.name}</p>
      }

      render(
        <Entity entity={entity}>
          <Test />
        </Entity>
      )

      expect(screen.getByText("John")).toBeInTheDocument()
    })
  })

  describe("when invoked outside of an entity context", () => {
    it("throws an error", () => {
      const { useCurrentEntity } = createReactAPI(new World<Entity>())

      const Test = () => {
        useCurrentEntity()
        return null
      }

      expect(() => render(<Test />)).toThrow(
        "useCurrentEntity must be called from a child of <Entity>."
      )
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
