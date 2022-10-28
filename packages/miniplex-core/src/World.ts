import { Bucket } from "./Bucket"
import { ArchetypeQuery, IEntity } from "./types"

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

  addComponent<C extends keyof E>(entity: E, component: C, value: E[C]) {
    /* Return early if the entity already has the component. */
    if (entity[component] !== undefined) return

    /* Set the component */
    entity[component] = value

    /* If this world doesn't know about the entity, we're done. */
    if (!this.has(entity)) return

    /* Update archetypes */
    for (const [predicate, archetype] of this.archetypes) {
      if (predicate(entity)) {
        archetype.add(entity)
      } else {
        archetype.remove(entity)
      }
    }
  }

  removeComponent(entity: E, component: keyof E) {
    /* Return early if the entity doesn't have the component. */
    if (entity[component] === undefined) return

    /* Update archetypes */
    if (this.has(entity)) {
      const copy = { ...entity }
      delete copy[component]

      for (const [predicate, archetype] of this.archetypes) {
        if (predicate(copy)) {
          archetype.add(entity)
        } else {
          archetype.remove(entity)
        }
      }
    }

    /* Remove the component */
    delete entity[component]
  }

  private archetypes = new Map<ArchetypeQuery<E, any>, Bucket<any>>()

  archetype<D extends E>(predicate: ArchetypeQuery<E, D>): Bucket<D> {
    /* First, try to find the archetype by its predicate. */
    let archetype = this.archetypes.get(predicate)

    /* If we still didn't find it, create it! */
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
