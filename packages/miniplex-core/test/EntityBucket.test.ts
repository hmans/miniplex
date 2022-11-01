import { Archetype, EntityBucket, With } from "../src"

type Entity = {
  name: string
  age?: number
  height?: number
}

type EntityWithAge = With<Entity, "age">

describe(EntityBucket, () => {
  describe("archetype", () => {
    it("returns an archetype bucket", () => {
      const bucket = new EntityBucket<Entity>()
      const archetype = bucket.archetype("age")
      expect(archetype).toBeInstanceOf(Archetype)
    })
  })
})
