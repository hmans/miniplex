import { Archetype } from "../src/Archetype"
import { World } from "../src/World"

describe("World", () => {
  describe("archetype", () => {
    it("creates an archetype", () => {
      const world = new World<{ name: string; age?: number }>()
      const archetype = world.archetype({ all: ["name"] })
      expect(archetype).toBeDefined()
      expect(archetype).toBeInstanceOf(Archetype)
    })
  })
})
