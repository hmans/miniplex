import { IEntity } from "./types"

/*
FIXME: the following has the problem that even though we are only tracking
entities through a WeakMap, we are keeping references to entities for all time
in a normal Map, meaning that they will never get garbage collected. We need a
way to unregister entities. Maybe `World` can do it for us?
*/

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
