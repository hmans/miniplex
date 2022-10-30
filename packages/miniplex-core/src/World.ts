import { Bucket } from "@miniplex/bucket"
import { IEntity } from "./types"

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
    if (this.has(entity)) this.test(entity)
  }

  removeComponent(entity: E, component: keyof E) {
    /* Return early if the entity doesn't even have the component. */
    if (entity[component] === undefined) return

    /* If this world knows about the entity, notify any derived buckets about the change. */
    if (this.has(entity)) {
      /* We're removing the component from a shallow copy of the entity so that we can
      test the predicate without mutating the entity. This allows us to remove the entity
      (and invoke all relevant onEntityRemoved callbacks) while it is still intact, which
      is important because the code in those callbacks may still need to be able to
      access the component's data. */

      const future = { ...entity }
      delete future[component]

      /* Go through all known buckets, check the future version of the entity against
      its predicate, and add/remove accordingly. */
      this.test(entity, future)
    }

    /* Remove the component. */
    delete entity[component]
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
