import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { World } from "miniplex"
import React from "react"
import { createComponents } from "../src"

describe("<Entity>", () => {
  it("creates an entity", () => {
    const bucket = new World()
    const { Entity } = createComponents(bucket)

    expect(bucket.entities.length).toBe(0)
    render(<Entity />)
    expect(bucket.entities.length).toBe(1)
  })

  it("removes the entity on unmount", () => {
    const bucket = new World()
    const { Entity } = createComponents(bucket)

    const { unmount } = render(<Entity />)
    expect(bucket.entities.length).toBe(1)
    unmount()
    expect(bucket.entities.length).toBe(0)
  })

  it("accepts a function as its child", () => {
    const bucket = new World<{ foo: string }>()
    const { Entity } = createComponents(bucket)

    const entity = bucket.add({ foo: "bar" })

    render(
      <Entity entity={entity}>{(entity) => <div>{entity.foo}</div>}</Entity>
    )

    expect(bucket.entities[0].foo).toBe("bar")
    expect(screen.getByText("bar")).toBeInTheDocument()
  })

  it("accepts a React function component as a child", () => {
    type Entity = { name: string; age: number }
    const bucket = new World<Entity>()
    const { Entity } = createComponents(bucket)

    const entity = bucket.add({ name: "Alice", age: 30 })

    const User = (entity: Entity) => <p>Name: {entity.name}</p>

    render(<Entity entity={entity} children={User} />)

    expect(screen.getByText("Name: Alice")).toBeInTheDocument()
  })

  describe("with a given entity that is not yet part of the bucket", () => {
    it("adds the entity to the bucket", () => {
      const bucket = new World()
      const { Entity } = createComponents(bucket)
      const entity = {}

      expect(bucket.entities.length).toBe(0)
      render(<Entity entity={entity} />)
      expect(bucket.entities.length).toBe(1)
      expect(bucket.entities[0]).toBe(entity)
    })

    it("removes the entity on unmount", () => {
      const bucket = new World()
      const { Entity } = createComponents(bucket)
      const entity = {}

      const { unmount } = render(<Entity entity={entity} />)
      expect(bucket.entities.length).toBe(1)
      unmount()
      expect(bucket.entities.length).toBe(0)
    })
  })
})

describe("<Property>", () => {
  it("assigns the specified property", () => {
    const bucket = new World()
    const { Entity, Property } = createComponents(bucket)

    render(
      <Entity>
        <Property name="foo" value="bar" />
      </Entity>
    )
    expect(bucket.entities[0]).toMatchObject({})
    expect(bucket.entities[0].foo).toBe("bar")
  })

  it("updates the specified property on re-rendering", () => {
    const bucket = new World()
    const { Entity, Property } = createComponents(bucket)

    const { rerender } = render(
      <Entity>
        <Property name="foo" value="bar" />
      </Entity>
    )
    expect(bucket.entities[0].foo).toBe("bar")

    rerender(
      <Entity>
        <Property name="foo" value="baz" />
      </Entity>
    )
    expect(bucket.entities[0].foo).toBe("baz")
  })

  it("removes the property when the component is unmounted", () => {
    const bucket = new World()
    const entity = bucket.add({})
    const { Entity, Property } = createComponents(bucket)

    const { unmount } = render(
      <Entity entity={entity}>
        <Property name="foo" value="bar" />
      </Entity>
    )
    expect(bucket.entities[0].foo).toBe("bar")

    unmount()
    expect(bucket.entities[0]).toMatchObject({})
  })

  it("captures the ref of the child when it has one", () => {
    const bucket = new World()
    const { Entity, Property } = createComponents(bucket)

    const ref = React.createRef<HTMLDivElement>()

    render(
      <Entity>
        <Property name="foo">
          <div ref={ref} />
        </Property>
      </Entity>
    )

    expect(bucket.entities[0].foo).toBe(ref.current)
  })
})

describe("<Entities>", () => {
  it("renders a list of entities", () => {
    const bucket = new World<{ name: string }>()
    const { Entities } = createComponents(bucket)

    bucket.add({ name: "Alice" })
    bucket.add({ name: "Bob" })

    render(
      <Entities entities={bucket.entities}>
        {(entity) => <p>{entity.name}</p>}
      </Entities>
    )

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })
})

describe("<Bucket>", () => {
  it("renders the entities within the given bucket", () => {
    const bucket = new World<{ name: string }>()
    const { Bucket } = createComponents(bucket)

    bucket.add({ name: "Alice" })
    bucket.add({ name: "Bob" })

    render(<Bucket bucket={bucket}>{(entity) => <p>{entity.name}</p>}</Bucket>)

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("re-renders the entities when the bucket contents change", () => {
    const bucket = new World<{ name: string }>()
    const { Bucket } = createComponents(bucket)

    bucket.add({ name: "Alice" })
    bucket.add({ name: "Bob" })

    const { rerender } = render(
      <Bucket bucket={bucket}>{(entity) => <p>{entity.name}</p>}</Bucket>
    )

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()

    bucket.add({ name: "Charlie" })
    rerender(
      <Bucket bucket={bucket}>{(entity) => <p>{entity.name}</p>}</Bucket>
    )

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("Charlie")).toBeInTheDocument()
  })
})

describe("<Archetype>", () => {
  it("renders the entities within the given archetype bucket", () => {
    const bucket = new World<{ name: string }>()
    const { Archetype } = createComponents(bucket)

    bucket.add({ name: "Alice" })
    bucket.add({ name: "Bob" })

    render(
      <Archetype properties="name">
        {(entity) => <p>{entity.name}</p>}
      </Archetype>
    )

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("re-renders the entities when the bucket contents change", () => {
    const bucket = new World<{ name: string }>()
    const { Archetype } = createComponents(bucket)

    bucket.add({ name: "Alice" })
    bucket.add({ name: "Bob" })

    const { rerender } = render(
      <Archetype properties="name">
        {(entity) => <p>{entity.name}</p>}
      </Archetype>
    )

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()

    bucket.add({ name: "Charlie" })
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
