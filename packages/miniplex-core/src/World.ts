import { EntityBucket } from "./buckets"

export class World<E> extends EntityBucket<E> {
  constructor(entities: E[] = []) {
    super(entities)

    /* When entities are removed, also make sure to forget about their IDs. */
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
      for (const bucket of this.buckets) {
        const has = bucket.has(entity)
        const wants = bucket.wants(entity)

        if (has && !wants) {
          bucket.remove(entity)
        } else if (!has && wants) {
          bucket.add(entity)
        }
      }
    }
  }

  removeComponent(entity: E, component: keyof E) {
    /* Return early if the entity doesn't even have the component. */
    if (entity[component] === undefined) return

    /* If this world knows about the entity, notify any derived buckets about the change. */
    if (this.has(entity)) {
      const future = { ...entity }
      delete future[component]

      for (const bucket of this.buckets) {
        const has = bucket.has(entity)
        const wants = bucket.wants(future) // !

        if (has && !wants) {
          bucket.remove(entity)
        } else if (!has && wants) {
          bucket.add(entity)
        }
      }
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
