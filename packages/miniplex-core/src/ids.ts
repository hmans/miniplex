import { IEntity } from "./types"

const entityToId = new WeakMap<IEntity, number>()
const idToEntity = new Map<number, IEntity>()

let nextId = 0

export const id = (entity: IEntity) => {
  if (!entityToId.has(entity)) {
    entityToId.set(entity, nextId)
    idToEntity.set(nextId, entity)
    return nextId++
  }

  return entityToId.get(entity)!
}

export const get = (id: number) => idToEntity.get(id)
