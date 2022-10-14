import { IEntity } from "./types"

const entityToId = new WeakMap<IEntity, number>()

let nextId = 0

export const id = (entity: IEntity) => {
  if (!entityToId.has(entity)) entityToId.set(entity, nextId++)
  return entityToId.get(entity)
}
