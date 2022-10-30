import { Bucket } from "@miniplex/bucket"
import { archetype, ArchetypeQuery } from "./queries"
import { IEntity, WithComponents } from "./types"

export class World<E extends IEntity> extends Bucket<E> {
  constructor(entities: E[] = []) {
    super(entities)

    this.onEntityRemoved.add((entity) => {
      /* Remove the entity from the ID map */
      if (this.entityToId.has(entity)) {
        const id = this.entityToId.get(entity)!
        this.idToEntity.delete(id)
        this.entityToId.delete(entity)
      }
    })
  }

  addComponent<C extends keyof E>(entity: E, component: C, value: E[C]) {
    /* Return early if the entity already has the component. */
    if (entity[component] !== undefined) return

    /* Set the component */
    entity[component] = value

    /* Touch the entity, triggering re-checks of indices */
    if (this.has(entity)) {
      this.test(entity)
    }
  }

  removeComponent(entity: E, component: keyof E) {
    /* Return early if the entity doesn't even have the component. */
    if (entity[component] === undefined) return

    /* If this world knows about the entity, notify any derived buckets about the change. */
    if (this.has(entity)) {
      const future = { ...entity }
      delete future[component]

      this.test(entity, future)
    }

    /* Remove the component. */
    delete entity[component]
  }

  archetype<With extends keyof E, Without extends keyof E>(
    query: Partial<ArchetypeQuery<E, With, Without>>
  ): Bucket<WithComponents<E, With>>

  archetype<With extends keyof E>(
    ...components: With[]
  ): Bucket<WithComponents<E, With>>

  archetype<With extends keyof E>(
    first: Partial<ArchetypeQuery<E, With, never>> | With,
    ...rest: With[]
  ): Bucket<WithComponents<E, With>> {
    return typeof first !== "object"
      ? this.where(archetype(first, ...rest))
      : this.where(archetype(first))
  }

  /* IDs */
  private entityToId = new Map<E, number>()
  private idToEntity = new Map<number, E>()
  private nextId = 0

  id(entity: E) {
    /* We only ever want to generate IDs for entities that are actually in the world. */
    if (!this.has(entity)) return undefined

    /* Lazily generate an ID. */
    if (!this.entityToId.has(entity)) {
      const id = this.nextId++
      this.entityToId.set(entity, id)
      this.idToEntity.set(id, entity)
    }

    return this.entityToId.get(entity)!
  }

  entity(id: number) {
    return this.idToEntity.get(id)
  }
}
