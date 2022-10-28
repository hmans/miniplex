import { Bucket } from "./Bucket"
import { IEntity, Predicate } from "./types"

export class World<E extends IEntity> extends Bucket<E> {
  [Symbol.iterator]() {
    let index = this.entities.length

    return {
      next: () => {
        const value = this.entities[--index]
        return { value, done: index < 0 }
      }
    }
  }

  private archetypes = new Map<Predicate<E>, Bucket<any>>()

  archetype<D extends E>(predicate: Predicate<D>) {
    let archetype = this.archetypes.get(predicate) as Bucket<D>

    if (!archetype) {
      /* Create a new bucket representing the archetype. */
      archetype = new Bucket<D>()
      this.archetypes.set(predicate, archetype)

      /* Add existing entities */
      for (const entity of this.entities) {
        if (predicate(entity)) {
          archetype.add(entity)
        }
      }
    }

    return archetype
  }
}
