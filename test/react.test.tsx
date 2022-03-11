import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { act } from "react-dom/test-utils"
import { IEntity, Tag } from "../src"
import { createECS } from "../src/react"

type Entity = { name: string } & IEntity

describe("createECS", () => {
  it("returns a useArchetype function", () => {
    const react = createECS<Entity>()
    expect(react).toHaveProperty("useArchetype")
  })

  describe("Entity", () => {
    it.todo("creates an entity")
    it.todo("accepts a ref and sets it to the created entity")
  })

  describe("Component", () => {
    it("adds a component to an entity", () => {
      const { world, Entity, Component } = createECS<Entity & { admin?: Tag }>()
      const alice = world.createEntity({ name: "Alice" })

      render(
        <Entity entity={alice}>
          <Component name="admin" data={true} />
        </Entity>
      )

      expect(alice.admin).toEqual(true)
    })

    it("it accepts a single React child to set as the entity's data", () => {
      const { world, Entity, Component } = createECS<Entity & { label?: HTMLElement }>()
      const alice = world.createEntity({ name: "Alice" })

      render(
        <Entity entity={alice}>
          <Component name="label">
            <p>Hello</p>
          </Component>
        </Entity>
      )

      expect(alice.label).toBeInstanceOf(HTMLParagraphElement)
      expect(alice.label.textContent).toEqual("Hello")
    })

    it("when passed a React child, it is also possible to pass a render function", () => {
      const { world, Entity, Component } = createECS<Entity & { label?: HTMLElement }>()
      const alice = world.createEntity({ name: "Alice" })

      render(
        <Entity entity={alice}>
          <Component name="label">{(entity) => <p>{entity.name}</p>}</Component>
        </Entity>
      )

      expect(alice.label).toBeInstanceOf(HTMLParagraphElement)
      expect(alice.label.textContent).toEqual("Alice")
    })
  })

  describe("useArchetype", () => {
    const setup = (fun?: Function) => {
      const { world, useArchetype } = createECS<Entity>()

      world.createEntity({ name: "Alice" })
      world.createEntity({ name: "Bob" })

      const Users = () => {
        const { entities } = useArchetype("name")

        fun?.()

        return (
          <ul>
            {entities.map(({ id, name }) => (
              <li key={id} data-testid={`user-${id}`}>
                {name}
              </li>
            ))}
          </ul>
        )
      }

      return { world, Users }
    }

    it("returns a list of entities matching the specified archetype", async () => {
      const { Users } = setup()

      render(<Users />)

      expect(screen.getByTestId("user-1")).toHaveTextContent("Alice")
      expect(screen.getByTestId("user-2")).toHaveTextContent("Bob")
    })

    it("re-renders the component when the archetype index updates", async () => {
      let renderCount = 0
      const { world, Users } = setup(() => renderCount++)

      /* queue a new entity to be added */
      const charles = world.queue.createEntity({ name: "Charles" })

      /* Render the component. At this point, Charles has not been added to the page. */
      render(<Users />)
      expect(screen.queryByText("Charles")).not.toBeInTheDocument()
      expect(renderCount).toEqual(2)

      /* Now flush the ECS queue. The component should now rerender. */
      act(() => world.queue.flush())
      expect(renderCount).toEqual(3)
      expect(screen.queryByText("Charles")).toBeInTheDocument()

      /* Now remove the entity again and check if the page rerenders. */
      world.queue.destroyEntity(charles)
      act(() => world.queue.flush())
      expect(screen.queryByText("Charles")).not.toBeInTheDocument()
      expect(renderCount).toEqual(4)
    })

    it("automatically rerenders the component when the list of entities changes", () => {})
  })

  describe("<Entities>", () => {
    it("accepts a collection of entities as a prop and renders them", () => {
      const { world, Entities } = createECS<Entity>()

      world.createEntity({ name: "Alice" })
      world.createEntity({ name: "Bob" })

      render(
        <Entities entities={world.entities}>
          {({ id, name }) => (
            <p key={id} data-testid={`user-${id}`}>
              {name}
            </p>
          )}
        </Entities>
      )

      expect(screen.getByTestId("user-1")).toHaveTextContent("Alice")
      expect(screen.getByTestId("user-2")).toHaveTextContent("Bob")
    })
  })

  describe("<Collection>", () => {
    it("renders entities of a specific tag", () => {
      const { world, Collection } = createECS<Entity>()

      world.createEntity({ name: "Alice" })
      world.createEntity({ name: "Bob" })

      render(
        <Collection tag="name">
          {({ id, name }) => (
            <p key={id} data-testid={`user-${id}`}>
              {name}
            </p>
          )}
        </Collection>
      )

      expect(screen.getByTestId("user-1")).toHaveTextContent("Alice")
      expect(screen.getByTestId("user-2")).toHaveTextContent("Bob")
    })

    it("automatically rerenders when an entity is added to the collection", () => {
      const { world, Collection } = createECS<Entity>()

      world.createEntity({ name: "Alice" })
      world.createEntity({ name: "Bob" })

      render(
        <Collection tag="name">
          {({ id, name }) => (
            <p key={id} data-testid={`user-${id}`}>
              {name}
            </p>
          )}
        </Collection>
      )

      expect(screen.getByTestId("user-1")).toHaveTextContent("Alice")
      expect(screen.getByTestId("user-2")).toHaveTextContent("Bob")

      act(() => {
        world.createEntity({ name: "Charlie" })
      })

      expect(screen.getByTestId("user-3")).toHaveTextContent("Charlie")
    })

    it("optionally memoizes entity components so they don't always rerender", () => {
      const { world, Collection } = createECS<Entity & { renderCount: number }>()

      const alice = world.createEntity({ name: "Alice", renderCount: 0 })
      const bob = world.createEntity({ name: "Bob", renderCount: 0 })

      render(
        <Collection tag="name" memoize>
          {(entity) => {
            entity.renderCount++

            return (
              <p key={entity.id} data-testid={`user-${entity.id}`}>
                {entity.name}
              </p>
            )
          }}
        </Collection>
      )

      expect(screen.getByTestId("user-1")).toHaveTextContent("Alice")
      expect(screen.getByTestId("user-2")).toHaveTextContent("Bob")

      expect(alice.renderCount).toEqual(1)
      expect(bob.renderCount).toEqual(1)

      act(() => {
        world.createEntity({ name: "Charlie", renderCount: 0 })
      })

      expect(screen.getByTestId("user-3")).toHaveTextContent("Charlie")
      expect(alice.renderCount).toEqual(1)
      expect(bob.renderCount).toEqual(1)
    })
  })
})
