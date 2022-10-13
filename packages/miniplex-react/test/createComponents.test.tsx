import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import React from "react"

import { Bucket } from "miniplex"
import { createComponents } from "../src"

describe("<Entity>", () => {
  it("creates an entity", () => {
    const bucket = new Bucket()
    const { Entity } = createComponents(bucket)

    expect(bucket.entities.length).toBe(0)
    render(<Entity />)
    expect(bucket.entities.length).toBe(1)
  })

  it("removes the entity on unmount", () => {
    const bucket = new Bucket()
    const { Entity } = createComponents(bucket)

    const { unmount } = render(<Entity />)
    expect(bucket.entities.length).toBe(1)
    unmount()
    expect(bucket.entities.length).toBe(0)
  })

  it("accepts a function as its child", () => {
    const bucket = new Bucket<{ foo: string }>()
    const { Entity } = createComponents(bucket)

    const entity = bucket.add({ foo: "bar" })

    render(
      <Entity entity={entity}>{({ entity }) => <div>{entity.foo}</div>}</Entity>
    )

    expect(bucket.entities[0].foo).toBe("bar")
    expect(screen.getByText("bar")).toBeInTheDocument()
  })

  it("accepts a React function component as a child", () => {
    type Entity = { name: string; age: number }
    const bucket = new Bucket<Entity>()
    const { Entity } = createComponents(bucket)

    const entity = bucket.add({ name: "Alice", age: 30 })

    const User = ({ entity }: { entity: Entity }) => <p>Name: {entity.name}</p>

    render(<Entity entity={entity} children={User} />)

    expect(screen.getByText("Name: Alice")).toBeInTheDocument()
  })

  describe("with a given entity that is not yet part of the bucket", () => {
    it("adds the entity to the bucket", () => {
      const bucket = new Bucket()
      const { Entity } = createComponents(bucket)
      const entity = {}

      expect(bucket.entities.length).toBe(0)
      render(<Entity entity={entity} />)
      expect(bucket.entities.length).toBe(1)
      expect(bucket.entities[0]).toBe(entity)
    })

    it("removes the entity on unmount", () => {
      const bucket = new Bucket()
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
    const bucket = new Bucket()
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
    const bucket = new Bucket()
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

  it("captures the ref of the child when it has one", () => {
    const bucket = new Bucket()
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
